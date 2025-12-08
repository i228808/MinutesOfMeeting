const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meeting_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeetingTranscript',
        default: null
    },
    task: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    remind_at: {
        type: Date,
        required: true
    },
    reminder_type: {
        type: String,
        enum: ['EMAIL', 'PUSH', 'BOTH'],
        default: 'EMAIL'
    },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'FAILED', 'CANCELLED'],
        default: 'PENDING'
    },
    sent_at: {
        type: Date,
        default: null
    },
    error_message: {
        type: String,
        default: null
    },
    // Recurrence (optional)
    is_recurring: {
        type: Boolean,
        default: false
    },
    recurrence_pattern: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', null],
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index for cron job queries
reminderSchema.index({ status: 1, remind_at: 1 });
reminderSchema.index({ user_id: 1, remind_at: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
