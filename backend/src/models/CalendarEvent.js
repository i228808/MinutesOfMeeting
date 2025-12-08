const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
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
    google_event_id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    deadline: {
        type: Date,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    attendees: [{
        email: String,
        name: String,
        response_status: {
            type: String,
            enum: ['needsAction', 'declined', 'tentative', 'accepted'],
            default: 'needsAction'
        }
    }],
    location: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED'
    },
    reminder_minutes: [{
        type: Number
    }],
    calendar_id: {
        type: String,
        default: 'primary'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes
calendarEventSchema.index({ user_id: 1, deadline: 1 });
calendarEventSchema.index({ google_event_id: 1 });
calendarEventSchema.index({ meeting_id: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
