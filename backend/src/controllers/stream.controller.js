const ExtensionStreamLog = require('../models/ExtensionStreamLog');
const MeetingTranscript = require('../models/MeetingTranscript');
const { asyncHandler } = require('../middleware/error.middleware');
const { audioService, llmService, LimitService } = require('../services');
const { generateSessionId } = require('../utils/helpers');
const { getIO } = require('../config/socket');

const redis = require('../config/redis');

// Constants
const SESSION_TTL = 3600; // 1 hour expiration for sessions
const CHUNK_THRESHOLD = 5; // Process after 5 chunks (~500KB - 1MB depending on chunk size)

/**
 * Start a new streaming session
 */
const startSession = asyncHandler(async (req, res) => {
    const { meeting_url, platform, team_id } = req.body;

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

    // Create log entry (Persistent DB)
    const streamLog = await ExtensionStreamLog.create({
        user_id: req.user._id,
        session_id: sessionId,
        meeting_url: meeting_url || null,
        platform: platform || 'OTHER',
        transcription_status: 'STREAMING',
        started_at: new Date()
    });

    // Initialize session in Redis
    const sessionData = {
        userId: req.user._id.toString(),
        logId: streamLog._id.toString(),
        teamId: team_id || '',
        partialTranscript: '',
        startTime: Date.now()
    };

    await redis.set(`session:${sessionId}:meta`, JSON.stringify(sessionData), 'EX', SESSION_TTL);

    // Clear any existing list (rare collision case)
    await redis.del(`session:${sessionId}:buffer`);

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

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    // Get session metadata from Redis
    const sessionMetaRaw = await redis.get(`session:${session_id}:meta`);

    if (!sessionMetaRaw) {
        return res.status(400).json({ error: 'Invalid or expired session' });
    }

    const session = JSON.parse(sessionMetaRaw);

    // Verify user owns this session
    if (session.userId !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Session access denied' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No audio chunk provided' });
    }

    try {
        // 1. Store the first chunk (WebM Header) separately if not set
        const headerKey = `session:${session_id}:header`;
        const hasHeader = await redis.exists(headerKey);

        if (!hasHeader) {
            // First chunk is assumed to be the header
            await redis.set(headerKey, req.file.buffer.toString('base64'), 'EX', SESSION_TTL);
        }

        // 2. Push chunk to Redis List (Buffer)
        // Store as base64 to ensure safe serialization
        await redis.rpush(`session:${session_id}:buffer`, req.file.buffer.toString('base64'));
        await redis.expire(`session:${session_id}:buffer`, SESSION_TTL);

        // 3. Check buffer size
        const bufferLen = await redis.llen(`session:${session_id}:buffer`);

        let transcription = null;
        let processed = false;

        if (bufferLen >= CHUNK_THRESHOLD) {
            processed = true;

            // Get all chunks
            const chunkStrings = await redis.lrange(`session:${session_id}:buffer`, 0, -1);

            // Get header
            const headerString = await redis.get(headerKey);

            if (chunkStrings.length > 0 && headerString) {
                // Clear buffer *before* processing to allow new chunks to accumulate
                await redis.del(`session:${session_id}:buffer`);

                // Reconstruct Buffer
                // Prepend header every time for ffmpeg (stateless processing trick)
                const headerBuf = Buffer.from(headerString, 'base64');
                const chunkBufs = chunkStrings.map(s => Buffer.from(s, 'base64'));
                const combinedBuffer = Buffer.concat([headerBuf, ...chunkBufs]);

                // Transcribe
                const result = await audioService.transcribeBuffer(combinedBuffer, 'webm', 'en');

                if (result && result.text) {
                    transcription = result.text;

                    // Update partial transcript in Redis
                    session.partialTranscript += ' ' + result.text;
                    await redis.set(`session:${session_id}:meta`, JSON.stringify(session), 'EX', SESSION_TTL);

                    // Update Mongo Log (async, fire and forget-ish but safe enough)
                    await ExtensionStreamLog.findByIdAndUpdate(session.logId, {
                        partial_transcript: session.partialTranscript,
                        $inc: { audio_chunks_received: bufferLen }
                    });

                    // Emit to client
                    try {
                        const io = getIO();
                        io.to(`user:${session.userId}`).emit('transcription', {
                            session_id,
                            text: result.text,
                            is_partial: true
                        });
                    } catch (e) {
                        // socket error ignored
                    }
                }
            }
        }

        res.json({
            success: true,
            transcription,
            processed
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

    if (!session_id) return res.status(400).json({ error: 'Session ID required' });

    const sessionMetaRaw = await redis.get(`session:${session_id}:meta`);
    if (!sessionMetaRaw) return res.status(400).json({ error: 'Invalid or expired session' });

    const session = JSON.parse(sessionMetaRaw);

    if (session.userId !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Session access denied' });
    }

    try {
        // Flush remaining chunks
        const chunkStrings = await redis.lrange(`session:${session_id}:buffer`, 0, -1);
        const headerString = await redis.get(`session:${session_id}:header`);

        let finalSegment = '';

        if (chunkStrings.length > 0 && headerString) {
            const headerBuf = Buffer.from(headerString, 'base64');
            const chunkBufs = chunkStrings.map(s => Buffer.from(s, 'base64'));
            const combinedBuffer = Buffer.concat([headerBuf, ...chunkBufs]);

            const result = await audioService.transcribeBuffer(combinedBuffer, 'webm');
            if (result && result.text) {
                finalSegment = result.text;
                session.partialTranscript += ' ' + finalSegment;
            }
        }

        const finalTranscript = session.partialTranscript.trim();

        // Cleanup Redis
        await redis.del(`session:${session_id}:meta`);
        await redis.del(`session:${session_id}:buffer`);
        await redis.del(`session:${session_id}:header`);

        // Finalize DB Record
        const streamLog = await ExtensionStreamLog.findByIdAndUpdate(
            session.logId,
            {
                transcription_status: 'COMPLETED',
                final_transcript: finalTranscript,
                ended_at: new Date()
            },
            { new: true }
        );

        const durationSeconds = Math.round((new Date() - new Date(streamLog.started_at)) / 1000);
        const durationMinutes = durationSeconds / 60;

        streamLog.duration_seconds = durationSeconds;
        await streamLog.save();

        // Usage limit update
        await LimitService.incrementUsage(req.user._id, 'audio', durationMinutes);

        // Create Meeting
        const effectiveTranscript = finalTranscript || '[No speech detected]';

        const meeting = await MeetingTranscript.create({
            user_id: req.user._id,
            team_id: session.teamId || null,
            title: title || `Live Meeting - ${new Date().toLocaleDateString()}`,
            raw_transcript: effectiveTranscript,
            audio_duration_minutes: durationMinutes,
            status: 'UPLOADED' // Set to UPLOADED first
        });

        // Trigger Analysis (Async background)
        // Note: In production, substitute this with BullMQ (as per audit)
        // For now, we keep the async IIFE but acknowledge the risk or implement BullMQ in next step
        (async () => {
            try {
                meeting.status = 'PROCESSING';
                await meeting.save();

                const analysis = await llmService.analyzeTranscript(effectiveTranscript);

                meeting.summary = analysis.summary || '';
                meeting.processed_actors = analysis.actors || [];
                meeting.processed_roles = analysis.roles || [];
                meeting.processed_responsibilities = analysis.responsibilities || [];
                meeting.processed_deadlines = analysis.deadlines || [];
                meeting.key_decisions = analysis.key_decisions || [];
                meeting.status = 'COMPLETED';
                await meeting.save();
            } catch (e) {
                console.error('Analysis failed', e);
                meeting.status = 'FAILED';
                meeting.error_message = e.message;
                await meeting.save();
            }
        })();

        res.json({
            success: true,
            session_id,
            duration_seconds: durationSeconds,
            meeting_id: meeting._id,
            message: 'Session ended'
        });

    } catch (error) {
        console.error('End session error:', error);
        throw error;
    }
});

/**
 * Get streaming session status
 */
const getSessionStatus = asyncHandler(async (req, res) => {
    const { session_id } = req.params;

    // Check Redis for active status
    const isActive = await redis.exists(`session:${session_id}:meta`);

    // Check DB for historical status
    const streamLog = await ExtensionStreamLog.findOne({
        session_id,
        user_id: req.user._id
    });

    if (!streamLog && !isActive) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
        session_id,
        status: isActive ? 'STREAMING' : (streamLog ? streamLog.transcription_status : 'UNKNOWN'),
        is_active: !!isActive,
        duration_seconds: streamLog ? streamLog.duration_seconds : 0,
        started_at: streamLog ? streamLog.started_at : null
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
