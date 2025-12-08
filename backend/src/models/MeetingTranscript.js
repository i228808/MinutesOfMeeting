const mongoose = require('mongoose');

const meetingTranscriptSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    raw_transcript: {
        type: String,
        default: ''
    },
    audio_file_path: {
        type: String,
        default: null
    },
    audio_duration_minutes: {
        type: Number,
        default: 0
    },
    // Processed LLM outputs
    processed_actors: [{
        name: String,
        email: String,
        identified_from: String // "mentioned" or "speaker"
    }],
    processed_roles: [{
        actor: String,
        role: String,
        department: String
    }],
    processed_responsibilities: [{
        actor: String,
        task: String,
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            default: 'MEDIUM'
        },
        status: {
            type: String,
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
            default: 'PENDING'
        }
    }],
    processed_deadlines: [{
        task: String,
        actor: String,
        deadline: Date,
        reminder_sent: {
            type: Boolean,
            default: false
        },
        calendar_event_id: String
    }],
    summary: {
        type: String,
        default: ''
    },
    key_decisions: [{
        decision: String,
        made_by: String,
        context: String
    }],
    status: {
        type: String,
        enum: ['UPLOADED', 'TRANSCRIBING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'UPLOADED'
    },
    error_message: {
        type: String,
        default: null
    },
    // Google Sheets integration
    sheets_exported: {
        type: Boolean,
        default: false
    },
    sheets_id: {
        type: String,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index for user queries
meetingTranscriptSchema.index({ user_id: 1, created_at: -1 });
meetingTranscriptSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model('MeetingTranscript', meetingTranscriptSchema);
