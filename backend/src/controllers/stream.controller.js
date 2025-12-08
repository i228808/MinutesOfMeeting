const ExtensionStreamLog = require('../models/ExtensionStreamLog');
const MeetingTranscript = require('../models/MeetingTranscript');
const { asyncHandler } = require('../middleware/error.middleware');
const { audioService, llmService, LimitService } = require('../services');
const { generateSessionId } = require('../utils/helpers');
const { getIO } = require('../config/socket');

// Store active stream processors by session
const activeProcessors = new Map();

/**
 * Start a new streaming session
 */
const startSession = asyncHandler(async (req, res) => {
    const { meeting_url, platform } = req.body;

    // Check if user can use extension
    const canStream = await LimitService.canPerformAction(req.user._id, 'extension');
    if (!canStream.allowed) {
        return res.status(403).json({
            error: 'Extension access denied',
            message: canStream.reason,
            upgrade_prompt: true
        });
    }

    const sessionId = generateSessionId();

    // Create log entry
    const streamLog = await ExtensionStreamLog.create({
        user_id: req.user._id,
        session_id: sessionId,
        meeting_url: meeting_url || null,
        platform: platform || 'OTHER',
        transcription_status: 'STREAMING',
        started_at: new Date()
    });

    // Initialize stream processor
    const processor = audioService.createStreamProcessor();
    activeProcessors.set(sessionId, {
        processor,
        userId: req.user._id.toString(),
        logId: streamLog._id,
        partialTranscript: ''
    });

    res.json({
        success: true,
        session_id: sessionId,
        message: 'Streaming session started'
    });
});

/**
 * Process an audio chunk from the extension
 */
const processChunk = asyncHandler(async (req, res) => {
    const { session_id } = req.body;

    if (!session_id || !activeProcessors.has(session_id)) {
        return res.status(400).json({ error: 'Invalid or expired session' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No audio chunk provided' });
    }

    const session = activeProcessors.get(session_id);

    // Verify user owns this session
    if (session.userId !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Session access denied' });
    }

    try {
        // Add chunk to processor
        const shouldProcess = session.processor.addChunk(req.file.buffer);

        let transcription = null;

        if (shouldProcess) {
            // Process accumulated chunks
            const result = await session.processor.process();

            if (result && result.text) {
                transcription = result.text;
                session.partialTranscript += ' ' + result.text;

                // Update log
                await ExtensionStreamLog.findByIdAndUpdate(session.logId, {
                    partial_transcript: session.partialTranscript,
                    audio_chunks_received: (await ExtensionStreamLog.findById(session.logId)).audio_chunks_received + 1
                });

                // Emit to client via Socket.IO
                try {
                    const io = getIO();
                    io.to(`user:${session.userId}`).emit('transcription', {
                        session_id,
                        text: result.text,
                        is_partial: true
                    });
                } catch (e) {
                    // Socket not available, continue anyway
                }
            }
        }

        res.json({
            success: true,
            transcription,
            processed: shouldProcess
        });
    } catch (error) {
        console.error('Chunk processing error:', error);
        res.status(500).json({ error: 'Failed to process audio chunk' });
    }
});

/**
 * End streaming session and finalize transcript
 */
const endSession = asyncHandler(async (req, res) => {
    const { session_id, title } = req.body;

    if (!session_id || !activeProcessors.has(session_id)) {
        return res.status(400).json({ error: 'Invalid or expired session' });
    }

    const session = activeProcessors.get(session_id);

    // Verify user owns this session
    if (session.userId !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Session access denied' });
    }

    try {
        // Flush any remaining audio
        const finalResult = await session.processor.flush();
        if (finalResult && finalResult.text) {
            session.partialTranscript += ' ' + finalResult.text;
        }

        const finalTranscript = session.partialTranscript.trim();

        // Update stream log
        const streamLog = await ExtensionStreamLog.findByIdAndUpdate(
            session.logId,
            {
                transcription_status: 'COMPLETED',
                final_transcript: finalTranscript,
                ended_at: new Date()
            },
            { new: true }
        );

        // Calculate duration
        const durationSeconds = Math.round(
            (new Date() - new Date(streamLog.started_at)) / 1000
        );
        const durationMinutes = durationSeconds / 60;

        streamLog.duration_seconds = durationSeconds;
        await streamLog.save();

        // Update audio usage
        await LimitService.incrementUsage(req.user._id, 'audio', durationMinutes);

        // Create a meeting transcript from the stream
        let meeting = null;
        // Always create a meeting record, even if transcript is empty/error
        // so the user sees a result in their dashboard.
        const effectiveTranscript = finalTranscript || '[No speech detected or recording error]';

        if (true) { // Always enter
            meeting = await MeetingTranscript.create({
                user_id: req.user._id,
                title: title || `Live Meeting - ${new Date().toLocaleDateString()}`,
                raw_transcript: effectiveTranscript,
                audio_duration_minutes: durationMinutes,
                status: 'UPLOADED'
            });

            streamLog.meeting_transcript_id = meeting._id;
            await streamLog.save();

            // Increment upload usage
            await LimitService.incrementUsage(req.user._id, 'upload');

            // --- TRIGGER ASYNC ANALYSIS ---
            // We do this asynchronously so we don't block the end session response
            (async () => {
                try {
                    console.log(`Starting post-stream analysis for meeting ${meeting._id}`);
                    meeting.status = 'PROCESSING';
                    await meeting.save();

                    const analysis = await llmService.analyzeTranscript(effectiveTranscript);

                    // Update meeting with analysis results
                    meeting.summary = analysis.summary || '';
                    meeting.processed_actors = analysis.actors || [];
                    meeting.processed_roles = analysis.roles || [];
                    meeting.processed_responsibilities = analysis.responsibilities || [];
                    meeting.processed_deadlines = analysis.deadlines || [];
                    meeting.key_decisions = analysis.key_decisions || [];
                    meeting.status = 'COMPLETED';
                    await meeting.save();

                    console.log(`Analysis complete for meeting ${meeting._id}`);
                } catch (analysisErr) {
                    console.error(`Analysis failed for meeting ${meeting._id}:`, analysisErr);
                    meeting.status = 'FAILED';
                    meeting.error_message = analysisErr.message;
                    await meeting.save();
                }
            })();
        }

        // Cleanup
        session.processor.clear();
        activeProcessors.delete(session_id);

        // Emit completion event
        try {
            const io = getIO();
            io.to(`user:${session.userId}`).emit('stream_ended', {
                session_id,
                duration_seconds: durationSeconds,
                meeting_id: meeting?._id
            });
        } catch (e) {
            // Socket not available
        }

        res.json({
            success: true,
            session_id,
            duration_seconds: durationSeconds,
            transcript_length: finalTranscript.length,
            meeting_id: meeting?._id,
            message: 'Streaming session ended successfully. Analysis started.'
        });
    } catch (error) {
        console.error('End session error:', error);

        // Cleanup on error
        activeProcessors.delete(session_id);

        throw error;
    }
});

/**
 * Get streaming session status
 */
const getSessionStatus = asyncHandler(async (req, res) => {
    const { session_id } = req.params;

    const streamLog = await ExtensionStreamLog.findOne({
        session_id,
        user_id: req.user._id
    });

    if (!streamLog) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const isActive = activeProcessors.has(session_id);

    res.json({
        session_id,
        status: streamLog.transcription_status,
        is_active: isActive,
        duration_seconds: streamLog.duration_seconds,
        chunks_received: streamLog.audio_chunks_received,
        started_at: streamLog.started_at,
        ended_at: streamLog.ended_at
    });
});

/**
 * List user's streaming sessions
 */
const listSessions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
        ExtensionStreamLog.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-partial_transcript -final_transcript'),
        ExtensionStreamLog.countDocuments({ user_id: req.user._id })
    ]);

    res.json({
        sessions,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        }
    });
});

module.exports = {
    startSession,
    processChunk,
    endSession,
    getSessionStatus,
    listSessions
};
