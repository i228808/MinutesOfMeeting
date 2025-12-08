const path = require('path');
const fs = require('fs');
const MeetingTranscript = require('../models/MeetingTranscript');
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

module.exports = {
    uploadTranscript,
    processTranscript,
    getMeeting,
    listMeetings,
    deleteMeeting,
    exportToSheets,
    createCalendarEvents
};
