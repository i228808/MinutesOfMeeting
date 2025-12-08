const path = require('path');
const fs = require('fs');
const MeetingTranscript = require('../models/MeetingTranscript');
const CalendarEvent = require('../models/CalendarEvent');
const { asyncHandler } = require('../middleware/error.middleware');
const { llmService, audioService, googleService, notificationService, LimitService } = require('../services');
const { paginate, paginateResponse } = require('../utils/helpers');

/**
 * Upload a meeting transcript or audio file
 */
const uploadTranscript = asyncHandler(async (req, res) => {
    const { title, transcript } = req.body;

    // Check upload limit
    const canUpload = await LimitService.canPerformAction(req.user._id, 'upload');
    if (!canUpload.allowed) {
        return res.status(429).json({
            error: 'Limit exceeded',
            message: canUpload.reason,
            upgrade_prompt: canUpload.upgrade_prompt
        });
    }

    let rawTranscript = transcript || '';
    let audioFilePath = null;
    let audioDuration = 0;

    // Handle audio file upload
    if (req.file) {
        audioFilePath = req.file.path;

        // Check audio limit (rough estimate before actual transcription)
        const estimatedMinutes = audioService.getAudioDuration(audioFilePath);
        const canTranscribe = await LimitService.canPerformAction(req.user._id, 'audio');
        if (!canTranscribe.allowed) {
            // Clean up uploaded file
            fs.unlinkSync(audioFilePath);
            return res.status(429).json({
                error: 'Audio limit exceeded',
                message: canTranscribe.reason,
                upgrade_prompt: canTranscribe.upgrade_prompt
            });
        }

        audioDuration = estimatedMinutes;
    }

    // Create meeting record
    const meeting = await MeetingTranscript.create({
        user_id: req.user._id,
        title: title || `Meeting ${new Date().toLocaleDateString()}`,
        raw_transcript: rawTranscript,
        audio_file_path: audioFilePath,
        audio_duration_minutes: audioDuration,
        status: audioFilePath ? 'UPLOADED' : (rawTranscript ? 'UPLOADED' : 'UPLOADED')
    });

    // Increment upload usage
    await LimitService.incrementUsage(req.user._id, 'upload');

    res.status(201).json({
        success: true,
        meeting: {
            id: meeting._id,
            title: meeting.title,
            status: meeting.status,
            has_audio: !!audioFilePath,
            has_transcript: !!rawTranscript,
            created_at: meeting.created_at
        }
    });
});

/**
 * Process meeting with LLM (transcribe if needed, then analyze)
 */
const processTranscript = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const meeting = await MeetingTranscript.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.status === 'PROCESSING') {
        return res.status(400).json({ error: 'Meeting is already being processed' });
    }

    if (meeting.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Meeting has already been processed' });
    }

    // Update status
    meeting.status = 'PROCESSING';
    await meeting.save();

    try {
        // Step 1: Transcribe audio if present and no transcript
        if (meeting.audio_file_path && !meeting.raw_transcript) {
            meeting.status = 'TRANSCRIBING';
            await meeting.save();

            const transcriptionResult = await audioService.transcribeAudio(meeting.audio_file_path);
            meeting.raw_transcript = transcriptionResult.text;
            meeting.audio_duration_minutes = transcriptionResult.duration / 60;

            // Update audio usage
            await LimitService.incrementUsage(req.user._id, 'audio', meeting.audio_duration_minutes);
        }

        if (!meeting.raw_transcript) {
            meeting.status = 'FAILED';
            meeting.error_message = 'No transcript available for processing';
            await meeting.save();
            return res.status(400).json({ error: 'No transcript to process' });
        }

        // Step 2: Analyze with LLM
        meeting.status = 'PROCESSING';
        await meeting.save();

        const analysis = await llmService.analyzeTranscript(meeting.raw_transcript);

        // Update meeting with analysis results
        meeting.summary = analysis.summary || '';
        meeting.processed_actors = analysis.actors || [];
        meeting.processed_roles = analysis.roles || [];
        meeting.processed_responsibilities = analysis.responsibilities || [];
        meeting.processed_deadlines = analysis.deadlines || [];
        meeting.key_decisions = analysis.key_decisions || [];
        meeting.status = 'COMPLETED';
        meeting.error_message = null;

        await meeting.save();

        // Auto-create calendar events from deadlines
        if (meeting.processed_deadlines?.length > 0) {
            try {
                for (const deadline of meeting.processed_deadlines) {
                    if (!deadline.deadline) continue;

                    // Check if already exists
                    const existing = await CalendarEvent.findOne({
                        user_id: req.user._id,
                        meeting_id: meeting._id,
                        title: deadline.task
                    });

                    if (!existing) {
                        const deadlineDate = new Date(deadline.deadline);
                        await CalendarEvent.create({
                            user_id: req.user._id,
                            meeting_id: meeting._id,
                            title: deadline.task,
                            description: `Assigned to: ${deadline.actor || 'Unassigned'}\nFrom meeting: ${meeting.title}`,
                            start_time: deadlineDate,
                            end_time: new Date(deadlineDate.getTime() + 60 * 60 * 1000),
                            all_day: true,
                            type: 'deadline',
                            color: '#f59e0b'
                        });
                    }
                }
                console.log(`Created ${meeting.processed_deadlines.length} calendar events from meeting deadlines`);
            } catch (calError) {
                console.error('Failed to create calendar events:', calError);
            }
        }

        // Send notification
        try {
            await notificationService.sendMeetingProcessedEmail(req.user, meeting);
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
        }

        res.json({
            success: true,
            meeting: {
                id: meeting._id,
                title: meeting.title,
                status: meeting.status,
                summary: meeting.summary,
                actors: meeting.processed_actors,
                roles: meeting.processed_roles,
                responsibilities: meeting.processed_responsibilities,
                deadlines: meeting.processed_deadlines,
                key_decisions: meeting.key_decisions
            }
        });

    } catch (error) {
        meeting.status = 'FAILED';
        meeting.error_message = error.message;
        await meeting.save();

        throw error;
    }
});

/**
 * Get single meeting details
 */
const getMeeting = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const meeting = await MeetingTranscript.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ meeting });
});

/**
 * List all user meetings
 */
const listMeetings = asyncHandler(async (req, res) => {
    const { page, limit, status, search } = req.query;
    const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

    const query = { user_id: req.user._id };

    if (status) {
        query.status = status.toUpperCase();
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } }
        ];
    }

    const [meetings, total] = await Promise.all([
        MeetingTranscript.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('-raw_transcript'), // Exclude full transcript for list view
        MeetingTranscript.countDocuments(query)
    ]);

    res.json(paginateResponse(meetings, total, pageNum, limitNum));
});

/**
 * Delete a meeting
 */
const deleteMeeting = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const meeting = await MeetingTranscript.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    // Delete audio file if exists
    if (meeting.audio_file_path && fs.existsSync(meeting.audio_file_path)) {
        fs.unlinkSync(meeting.audio_file_path);
    }

    await meeting.deleteOne();

    res.json({ success: true, message: 'Meeting deleted' });
});

/**
 * Export meeting data to Google Sheets
 */
const exportToSheets = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const meeting = await MeetingTranscript.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.status !== 'COMPLETED') {
        return res.status(400).json({ error: 'Meeting must be processed before export' });
    }

    // Idempotency: Open existing sheet if already exported
    if (meeting.sheets_exported && meeting.sheets_id) {
        return res.json({
            success: true,
            spreadsheet: {
                id: meeting.sheets_id,
                url: `https://docs.google.com/spreadsheets/d/${meeting.sheets_id}`,
                already_existed: true
            }
        });
    }

    // Create new spreadsheet
    const spreadsheet = await googleService.createSpreadsheet(
        req.user,
        `Meeting Minutes - ${meeting.title}`
    );

    // Write meeting data
    await googleService.writeMeetingToSheet(req.user, spreadsheet.spreadsheetId, {
        title: meeting.title,
        summary: meeting.summary,
        actors: meeting.processed_actors,
        responsibilities: meeting.processed_responsibilities,
        deadlines: meeting.processed_deadlines,
        status: meeting.status
    });

    // Update meeting record
    meeting.sheets_exported = true;
    meeting.sheets_id = spreadsheet.spreadsheetId;
    await meeting.save();

    res.json({
        success: true,
        spreadsheet: {
            id: spreadsheet.spreadsheetId,
            url: spreadsheet.spreadsheetUrl
        }
    });
});

/**
 * Create calendar events for meeting deadlines
 */
const createCalendarEvents = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const meeting = await MeetingTranscript.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    if (!meeting.processed_deadlines?.length) {
        return res.status(400).json({ error: 'No deadlines to create events for' });
    }

    const events = await googleService.createDeadlineEvents(
        req.user,
        meeting._id,
        meeting.processed_deadlines
    );

    // Update deadline records with calendar event IDs
    for (const event of events) {
        const deadline = meeting.processed_deadlines.find(d => d.task === event.task);
        if (deadline) {
            deadline.calendar_event_id = event.eventId;
        }
    }
    await meeting.save();

    res.json({
        success: true,
        events_created: events.length,
        events
    });
});

/**
 * Analyze transcript or audio - for review before confirm
 * Handles both text transcript and audio file (transcribes first)
 */
const analyzeOnly = asyncHandler(async (req, res) => {
    const { transcript, title } = req.body;
    let rawTranscript = transcript || '';

    // If audio file was uploaded, transcribe it first
    if (req.file) {
        try {
            console.log('Transcribing audio file:', req.file.path);
            const transcriptionResult = await audioService.transcribeAudio(req.file.path);
            rawTranscript = transcriptionResult.text;
            console.log('Transcription complete, length:', rawTranscript.length);

            // Clean up the uploaded file after transcription
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (transcribeError) {
            // Clean up on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            throw new Error(`Transcription failed: ${transcribeError.message}`);
        }
    }

    if (!rawTranscript) {
        return res.status(400).json({ error: 'Transcript or audio file is required' });
    }

    // Analyze with LLM
    const analysis = await llmService.analyzeTranscript(rawTranscript);

    res.json({
        success: true,
        title: title || `Meeting ${new Date().toLocaleDateString()}`,
        transcript: rawTranscript,
        analysis: {
            summary: analysis.summary || '',
            actors: analysis.actors || [],
            roles: analysis.roles || [],
            responsibilities: analysis.responsibilities || [],
            deadlines: analysis.deadlines || [],
            key_decisions: analysis.key_decisions || [],
            contract_detected: analysis.contract_detected || false,
            contract_elements: analysis.contract_elements || null
        }
    });
});

/**
 * Confirm and save reviewed meeting data + create calendar events + reminders
 */
const confirmMeeting = asyncHandler(async (req, res) => {
    const {
        title,
        transcript,
        summary,
        actors,
        roles,
        responsibilities,
        deadlines,
        key_decisions
    } = req.body;

    if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
    }

    // Check upload limit
    const canUpload = await LimitService.canPerformAction(req.user._id, 'upload');
    if (!canUpload.allowed) {
        return res.status(429).json({
            error: 'Limit exceeded',
            message: canUpload.reason,
            upgrade_prompt: canUpload.upgrade_prompt
        });
    }

    // Create meeting with all analyzed data
    const meeting = await MeetingTranscript.create({
        user_id: req.user._id,
        title: title || `Meeting ${new Date().toLocaleDateString()}`,
        raw_transcript: transcript,
        summary: summary || '',
        processed_actors: actors || [],
        processed_roles: roles || [],
        processed_responsibilities: responsibilities || [],
        processed_deadlines: deadlines || [],
        key_decisions: key_decisions || [],
        status: 'COMPLETED'
    });

    // Increment upload usage
    await LimitService.incrementUsage(req.user._id, 'upload');

    // Create calendar events and reminders from deadlines
    const createdEvents = [];
    const createdReminders = [];

    if (deadlines?.length > 0) {
        const Reminder = require('../models/Reminder');

        for (const deadline of deadlines) {
            if (!deadline.deadline) continue;

            const deadlineDate = new Date(deadline.deadline);

            // Create calendar event
            const event = await CalendarEvent.create({
                user_id: req.user._id,
                meeting_id: meeting._id,
                title: deadline.task,
                description: `Assigned to: ${deadline.actor || 'Unassigned'}\nFrom meeting: ${meeting.title}`,
                start_time: deadlineDate,
                end_time: new Date(deadlineDate.getTime() + 60 * 60 * 1000),
                all_day: true,
                type: 'deadline',
                color: '#f59e0b'
            });
            createdEvents.push(event);

            // Create reminder (1 day before deadline)
            const reminderDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);
            if (reminderDate > new Date()) {
                const reminder = await Reminder.create({
                    user_id: req.user._id,
                    meeting_id: meeting._id,
                    task: deadline.task,
                    message: `Reminder: "${deadline.task}" is due tomorrow. Assigned to: ${deadline.actor || 'Unassigned'}`,
                    remind_at: reminderDate,
                    reminder_type: 'EMAIL',
                    status: 'PENDING'
                });
                createdReminders.push(reminder);
            }
        }
    }

    res.status(201).json({
        success: true,
        meeting: {
            id: meeting._id,
            title: meeting.title,
            status: meeting.status,
            summary: meeting.summary
        },
        events_created: createdEvents.length,
        reminders_created: createdReminders.length
    });
});

/**
 * Update meeting details (Edit) and sync changes to Calendar/Reminders
 */
const updateMeeting = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        summary,
        actors,
        roles,
        responsibilities,
        processed_responsibilities,
        deadlines,
        processed_deadlines,
        key_decisions
    } = req.body;

    const meeting = await MeetingTranscript.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    // Update fields if provided
    // Use alias if main key is missing
    const responsibilitiesToUse = responsibilities || processed_responsibilities;
    const deadlinesToUse = deadlines || processed_deadlines;

    if (title) meeting.title = title;
    if (summary) meeting.summary = summary;
    if (actors) meeting.processed_actors = actors;
    if (roles) meeting.processed_roles = roles;
    if (responsibilitiesToUse) meeting.processed_responsibilities = responsibilitiesToUse;
    if (deadlinesToUse) meeting.processed_deadlines = deadlinesToUse;
    if (key_decisions) meeting.key_decisions = key_decisions;

    await meeting.save();

    // Logic to sync Calendar Events and Reminders if Deadlines changed
    // Strategy: Delete existing for this meeting and re-create based on new deadlines
    // This handles additions, removals, and updates robustly.

    if (deadlines) {
        const Reminder = require('../models/Reminder');

        // 1. Delete existing
        await CalendarEvent.deleteMany({ meeting_id: meeting._id });
        await Reminder.deleteMany({ meeting_id: meeting._id });

        // 2. Re-create from new deadlines
        const createdEvents = [];
        const createdReminders = [];

        for (const deadline of deadlines) {
            if (!deadline.deadline || !deadline.task) continue;

            const deadlineDate = new Date(deadline.deadline);
            if (isNaN(deadlineDate.getTime())) continue;

            // Calendar Event
            const event = await CalendarEvent.create({
                user_id: req.user._id,
                meeting_id: meeting._id,
                title: deadline.task,
                description: `Assigned to: ${deadline.actor || 'Unassigned'}\nFrom meeting: ${meeting.title}`,
                start_time: deadlineDate,
                end_time: new Date(deadlineDate.getTime() + 60 * 60 * 1000),
                all_day: true,
                type: 'deadline',
                color: '#f59e0b'
            });
            createdEvents.push(event);

            // Reminder (1 day before)
            const reminderDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);
            if (reminderDate > new Date()) {
                const reminder = await Reminder.create({
                    user_id: req.user._id,
                    meeting_id: meeting._id,
                    task: deadline.task,
                    message: `Reminder: "${deadline.task}" is due tomorrow. Assigned to: ${deadline.actor || 'Unassigned'}`,
                    remind_at: reminderDate,
                    reminder_type: 'EMAIL',
                    status: 'PENDING'
                });
                createdReminders.push(reminder);
            }
        }
        console.log(`Synced: Re-created ${createdEvents.length} events and ${createdReminders.length} reminders for meeting ${meeting._id}`);
    }

    res.json({
        success: true,
        message: 'Meeting updated and synced',
        meeting: {
            id: meeting._id,
            title: meeting.title,
            status: meeting.status,
            summary: meeting.summary,
            actors: meeting.processed_actors,
            roles: meeting.processed_roles,
            responsibilities: meeting.processed_responsibilities,
            deadlines: meeting.processed_deadlines,
            key_decisions: meeting.key_decisions
        }
    });
});

module.exports = {
    uploadTranscript,
    processTranscript,
    getMeeting,
    listMeetings,
    deleteMeeting,
    exportToSheets,
    createCalendarEvents,
    analyzeOnly,
    confirmMeeting,
    updateMeeting
};
