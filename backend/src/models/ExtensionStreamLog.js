const mongoose = require('mongoose');

const extensionStreamLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    session_id: {
        type: String,
        required: true,
        unique: true
    },
    meeting_url: {
        type: String,
        default: null
    },
    platform: {
        type: String,
        enum: ['GOOGLE_MEET', 'ZOOM', 'TEAMS', 'OTHER'],
        default: 'OTHER'
    },
    duration_seconds: {
        type: Number,
        default: 0
    },
    audio_chunks_received: {
        type: Number,
        default: 0
    },
    transcription_status: {
        type: String,
        enum: ['STREAMING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'STREAMING'
    },
    partial_transcript: {
        type: String,
        default: ''
    },
    final_transcript: {
        type: String,
        default: ''
    },
    // Link to created meeting transcript
    meeting_transcript_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeetingTranscript',
        default: null
    },
    started_at: {
        type: Date,
        default: () => new Date()
    },
    ended_at: {
        type: Date,
        default: null
    },
    error_message: {
        type: String,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes (session_id index is created automatically by unique: true)
extensionStreamLogSchema.index({ user_id: 1, created_at: -1 });
extensionStreamLogSchema.index({ transcription_status: 1 });

module.exports = mongoose.model('ExtensionStreamLog', extensionStreamLogSchema);
