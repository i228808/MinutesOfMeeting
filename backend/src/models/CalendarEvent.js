const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
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
    description: {
        type: String,
        default: ''
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    all_day: {
        type: Boolean,
        default: false
    },
    // Link to source meeting (if event was created from meeting deadlines)
    meeting_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeetingTranscript',
        default: null
    },
    // Type of event
    type: {
        type: String,
        enum: ['deadline', 'reminder', 'meeting', 'custom'],
        default: 'custom'
    },
    // Color for calendar display
    color: {
        type: String,
        default: '#d97706' // Amber color
    },
    location: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED'
    },
    // For future Google Calendar sync
    synced_to_google: {
        type: Boolean,
        default: false
    },
    google_event_id: {
        type: String,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes for efficient queries
calendarEventSchema.index({ user_id: 1, start_time: 1 });
calendarEventSchema.index({ user_id: 1, meeting_id: 1 });
calendarEventSchema.index({ google_event_id: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
