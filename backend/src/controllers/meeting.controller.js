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
// ... imports remain the same

/**
 * Upload a meeting transcript or audio file
 */
const uploadTranscript = asyncHandler(async (req, res) => {
    const { title, transcript, team_id } = req.body;

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
        team_id: team_id || null, // Optional team association
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
            created_at: meeting.created_at,
            team_id: meeting.team_id
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

        // Step 1.5: Get Team Members Context if Team Meeting
        let teamMembers = [];
        if (meeting.team_id) {
            const Team = require('../models/Team');
            const team = await Team.findById(meeting.team_id).populate('members', 'name email _id');
            if (team && team.members) {
                teamMembers = team.members.map(m => ({
                    name: m.name,
                    id: m._id.toString(),
                    email: m.email
                }));
            }
        }

        // Step 2: Analyze with LLM (Pass team members for context)
        meeting.status = 'PROCESSING';
        await meeting.save();

        const analysis = await llmService.analyzeTranscript(meeting.raw_transcript, teamMembers);

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

        // Auto-create calendar events & reminders from deadlines
        if (meeting.processed_deadlines?.length > 0) {
            const Reminder = require('../models/Reminder');
            try {
                for (const deadline of meeting.processed_deadlines) {
                    if (!deadline.deadline) continue;

                    // Determine Target User (intelligent matching)
                    let targetUserId = req.user._id; // Default to uploader if no match
                    let targetUserName = 'You';

                    if (meeting.team_id && deadline.actor && teamMembers.length > 0) {
                        // Fuzzy match actor name to team member
                        const normalizedActor = deadline.actor.toLowerCase();
                        const matchedMember = teamMembers.find(m =>
                            m.name.toLowerCase().includes(normalizedActor) ||
                            normalizedActor.includes(m.name.toLowerCase())
                        );

                        if (matchedMember) {
                            targetUserId = matchedMember.id;
                            targetUserName = matchedMember.name;
                        }
                    }

                    // Check if already exists for THAT user
                    const existing = await CalendarEvent.findOne({
                        user_id: targetUserId,
                        meeting_id: meeting._id,
                        title: deadline.task
                    });

                    if (!existing) {
                        const deadlineDate = new Date(deadline.deadline);
                        if (isNaN(deadlineDate.getTime())) continue;

                        // Create Calendar Event
                        await CalendarEvent.create({
                            user_id: targetUserId,
                            meeting_id: meeting._id,
                            title: deadline.task,
                            description: `Action Item from: ${meeting.title}\nAssigned to: ${deadline.actor}`,
                            start_time: deadlineDate,
                            end_time: new Date(deadlineDate.getTime() + 60 * 60 * 1000),
                            all_day: true,
                            type: 'deadline',
                            color: '#f59e0b'
                        });

                        // Create Reminder (1 day before)
                        const reminderDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);
                        if (reminderDate > new Date()) {
                            await Reminder.create({
                                user_id: targetUserId,
                                meeting_id: meeting._id,
                                task: deadline.task,
                                message: `Reminder: "${deadline.task}" is due tomorrow. (From Team Meeting: ${meeting.title})`,
                                remind_at: reminderDate,
                                reminder_type: 'EMAIL',
                                status: 'PENDING'
                            });
                        }
                    }
                }
                console.log(`Processed ${meeting.processed_deadlines.length} deadlines with intelligent assignment`);
            } catch (calError) {
                console.error('Failed to create calendar events/reminders:', calError);
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

    // Find meeting by ID and populate team info
    const meeting = await MeetingTranscript.findById(id).populate('team_id');

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    // Determine edit permission
    let canEdit = false;
    let hasAccess = false;

    const isMeetingOwner = meeting.user_id.toString() === req.user._id.toString();

    if (meeting.team_id) {
        // Team meeting - check team membership first
        const userTeams = req.user.teams || [];
        const isTeamMember = userTeams.some(t => {
            const tId = t._id ? t._id.toString() : t.toString();
            return tId === (meeting.team_id._id || meeting.team_id).toString();
        });

        if (isTeamMember || isMeetingOwner) {
            hasAccess = true;
            // For team meetings, ONLY team owner can edit
            const Team = require('../models/Team');
            const team = await Team.findById(meeting.team_id._id || meeting.team_id);
            canEdit = team && team.owner_id.toString() === req.user._id.toString();
        }
    } else {
        // Personal meeting - only owner has access AND can edit
        if (isMeetingOwner) {
            hasAccess = true;
            canEdit = true;
        }
    }

    if (!hasAccess) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    return res.json({ meeting, can_edit: canEdit });
});

/**
 * List all user meetings
 */
const listMeetings = asyncHandler(async (req, res) => {
    const { page, limit, status, search, team_id } = req.query;
    const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

    // Base query: Personal meetings OR Team meetings
    let query = {};

    if (team_id) {
        // Explicitly requesting team meetings
        query = { team_id: team_id };
        // Check if user is member of this team... (Optional check, but safe given middleware often handles User info)
        // For strict security, we could verify membership here, but getTeamDetails does it.
    } else {
        // Default: Personal meetings only (no team)
        query = { user_id: req.user._id, team_id: null };
    }

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

    // 1. Try to create Google Calendar events
    let googleEvents = [];
    try {
        if (req.user.google_access_token) {
            googleEvents = await googleService.createDeadlineEvents(
                req.user,
                meeting._id,
                meeting.processed_deadlines
            );
        }
    } catch (error) {
        console.error('Google Calendar Sync Failed:', error);
        // Continue to create local events regardless
    }

    const createdLocalEvents = [];

    // 2. Create Local Calendar Events & Update Meeting
    for (const deadline of meeting.processed_deadlines) {
        if (!deadline.deadline || !deadline.task) continue;

        // Find matching Google Event if it was created
        const googleEvent = googleEvents.find(e => e.task === deadline.task);
        if (googleEvent) {
            deadline.calendar_event_id = googleEvent.eventId;
        }

        const deadlineDate = new Date(deadline.deadline);
        // Default to 9 AM - 10 AM to match Google Service logic if used, otherwise standard
        deadlineDate.setHours(9, 0, 0, 0);
        const endTime = new Date(deadlineDate);
        endTime.setHours(10, 0, 0, 0);

        // Check if exists locally
        let event = await CalendarEvent.findOne({
            user_id: req.user._id,
            meeting_id: meeting._id,
            title: deadline.task
        });

        if (!event) {
            event = await CalendarEvent.create({
                user_id: req.user._id,
                meeting_id: meeting._id,
                google_event_id: googleEvent ? googleEvent.eventId : undefined,
                title: deadline.task,
                description: `Assigned to: ${deadline.actor || 'Unassigned'}\nFrom meeting: ${meeting.title}`,
                start_time: deadlineDate,
                end_time: endTime,
                deadline: new Date(deadline.deadline),
                all_day: false,
                type: 'deadline',
                color: '#f59e0b',
                status: 'SCHEDULED'
            });
            createdLocalEvents.push(event);
        } else if (googleEvent && !event.google_event_id) {
            // Link existing local event to Google event if just synced
            event.google_event_id = googleEvent.eventId;
            await event.save();
        }
    }

    await meeting.save();

    res.json({
        success: true,
        events_created: createdLocalEvents.length,
        google_sync_count: googleEvents.length,
        events: createdLocalEvents
    });
});

/**
 * Analyze transcript or audio - for review before confirm
 * Handles both text transcript and audio file (transcribes first)
 */
const analyzeOnly = asyncHandler(async (req, res) => {
    const { transcript, title, team_id } = req.body;
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

    // Get Team Members Context if Team Meeting
    let teamMembers = [];
    if (team_id) {
        const Team = require('../models/Team');
        const team = await Team.findById(team_id).populate('members', 'name email _id');
        if (team && team.members) {
            teamMembers = team.members.map(m => ({
                name: m.name,
                id: m._id.toString(),
                email: m.email
            }));
        }
    }

    // Analyze with LLM
    const analysis = await llmService.analyzeTranscript(rawTranscript, teamMembers);

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
        key_decisions,
        team_id
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
        team_id: team_id || null,
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

    // Fetch team members for assignment context
    let teamMembers = [];
    if (team_id) {
        const Team = require('../models/Team');
        const team = await Team.findById(team_id).populate('members', 'name email _id');
        if (team && team.members) {
            teamMembers = team.members.map(m => ({
                name: m.name,
                id: m._id.toString(),
                email: m.email
            }));
        }
    }

    if (deadlines?.length > 0) {
        const Reminder = require('../models/Reminder');

        for (const deadline of deadlines) {
            if (!deadline.deadline) continue;

            const deadlineDate = new Date(deadline.deadline);
            if (isNaN(deadlineDate.getTime())) continue;

            // Determine Target User (intelligent matching)
            let targetUserId = req.user._id; // Default to uploader if no match
            let targetUserName = 'You';

            if (team_id && deadline.actor && teamMembers.length > 0) {
                // Fuzzy match actor name to team member
                const normalizedActor = deadline.actor.toLowerCase();
                const matchedMember = teamMembers.find(m =>
                    m.name.toLowerCase().includes(normalizedActor) ||
                    normalizedActor.includes(m.name.toLowerCase())
                );

                if (matchedMember) {
                    targetUserId = matchedMember.id;
                    targetUserName = matchedMember.name;
                }
            }

            // Create calendar event
            const event = await CalendarEvent.create({
                user_id: targetUserId,
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
                    user_id: targetUserId,
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

    const meeting = await MeetingTranscript.findById(id).populate('team_id');

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    // Authorization check
    if (meeting.team_id) {
        // Team meeting - only team owner can edit
        const Team = require('../models/Team');
        const team = await Team.findById(meeting.team_id._id || meeting.team_id);

        if (!team) {
            return res.status(404).json({ error: 'Associated team not found' });
        }

        if (team.owner_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Permission denied',
                message: 'Only the team owner can edit team meeting details'
            });
        }
    } else {
        // Personal meeting - only owner can edit
        if (meeting.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Meeting not found' });
        }
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

/**
 * Retry analysis for meetings with PENDING_ANALYSIS status
 */
const retryAnalysis = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const meeting = await MeetingTranscript.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    if (!['PENDING_ANALYSIS', 'FAILED'].includes(meeting.status)) {
        return res.status(400).json({
            error: 'Cannot retry',
            message: `Meeting status is ${meeting.status}. Only PENDING_ANALYSIS or FAILED meetings can be retried.`
        });
    }

    if (!meeting.raw_transcript || meeting.raw_transcript.length < 10) {
        return res.status(400).json({
            error: 'No transcript available',
            message: 'This meeting has no transcript to analyze.'
        });
    }

    // Update status to processing
    meeting.status = 'PROCESSING';
    meeting.error_message = null;
    await meeting.save();

    // Run analysis async
    res.json({
        success: true,
        message: 'Analysis retry started. Refresh in a few moments to see results.',
        meeting_id: meeting._id
    });

    // Async analysis
    (async () => {
        try {
            console.log(`[RetryAnalysis] Starting for meeting ${meeting._id}`);
            const analysis = await llmService.analyzeTranscript(meeting.raw_transcript);

            meeting.summary = analysis.summary || '';
            meeting.processed_actors = analysis.actors || [];
            meeting.processed_roles = analysis.roles || [];
            meeting.processed_responsibilities = analysis.responsibilities || [];
            meeting.processed_deadlines = analysis.deadlines || [];
            meeting.key_decisions = analysis.key_decisions || [];
            meeting.status = 'COMPLETED';
            meeting.error_message = null;
            await meeting.save();

            console.log(`[RetryAnalysis] Completed for meeting ${meeting._id}`);
        } catch (err) {
            console.error(`[RetryAnalysis] Failed for meeting ${meeting._id}:`, err);
            meeting.status = 'PENDING_ANALYSIS';
            meeting.error_message = `Retry failed: ${err.message}`;
            await meeting.save();
        }
    })();
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
    updateMeeting,
    retryAnalysis
};
