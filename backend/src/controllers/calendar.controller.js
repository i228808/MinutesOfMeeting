const CalendarEvent = require('../models/CalendarEvent');
const MeetingTranscript = require('../models/MeetingTranscript');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, paginateResponse } = require('../utils/helpers');

/**
 * Get all events for a date range
 */
const getEvents = asyncHandler(async (req, res) => {
    const { start, end, type } = req.query;

    const query = { user_id: req.user._id };

    // Filter by date range if provided
    if (start && end) {
        query.start_time = {
            $gte: new Date(start),
            $lte: new Date(end)
        };
    }

    // Filter by type if provided
    if (type) {
        query.type = type;
    }

    const events = await CalendarEvent.find(query)
        .sort({ start_time: 1 })
        .populate('meeting_id', 'title');

    res.json({ events });
});

/**
 * Create a new event
 */
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, start_time, end_time, all_day, type, color, location } = req.body;

    if (!title || !start_time || !end_time) {
        return res.status(400).json({ error: 'Title, start_time, and end_time are required' });
    }

    const event = await CalendarEvent.create({
        user_id: req.user._id,
        title,
        description: description || '',
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        all_day: all_day || false,
        type: type || 'custom',
        color: color || '#d97706',
        location: location || ''
    });

    res.status(201).json({ event });
});

/**
 * Get single event
 */
const getEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
        _id: id,
        user_id: req.user._id
    }).populate('meeting_id', 'title summary');

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
});

/**
 * Update an event
 */
const updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const event = await CalendarEvent.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'start_time', 'end_time', 'all_day', 'type', 'color', 'location', 'status'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            event[field] = updates[field];
        }
    });

    await event.save();

    res.json({ event });
});

/**
 * Delete an event
 */
const deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    await event.deleteOne();

    res.json({ success: true, message: 'Event deleted' });
});

/**
 * Import deadlines from a meeting as calendar events
 */
const importFromMeeting = asyncHandler(async (req, res) => {
    const { meeting_id } = req.body;

    const meeting = await MeetingTranscript.findOne({
        _id: meeting_id,
        user_id: req.user._id
    });

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    if (!meeting.processed_deadlines?.length) {
        return res.status(400).json({ error: 'No deadlines to import' });
    }

    const createdEvents = [];

    for (const deadline of meeting.processed_deadlines) {
        if (!deadline.deadline) continue;

        // Check if already imported
        const existing = await CalendarEvent.findOne({
            user_id: req.user._id,
            meeting_id: meeting._id,
            title: deadline.task
        });

        if (existing) continue;

        const deadlineDate = new Date(deadline.deadline);

        const event = await CalendarEvent.create({
            user_id: req.user._id,
            meeting_id: meeting._id,
            title: deadline.task,
            description: `Assigned to: ${deadline.actor || 'Unassigned'}\nFrom meeting: ${meeting.title}`,
            start_time: deadlineDate,
            end_time: new Date(deadlineDate.getTime() + 60 * 60 * 1000), // 1 hour duration
            all_day: true,
            type: 'deadline',
            color: '#f59e0b' // Orange for deadlines
        });

        createdEvents.push(event);
    }

    res.json({
        success: true,
        events_created: createdEvents.length,
        events: createdEvents
    });
});

/**
 * Get upcoming events/deadlines
 */
const getUpcoming = asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;

    const now = new Date();
    const futureDate = new Date(now.getTime() + (parseInt(days) * 24 * 60 * 60 * 1000));

    const events = await CalendarEvent.find({
        user_id: req.user._id,
        start_time: { $gte: now, $lte: futureDate },
        status: 'SCHEDULED'
    })
        .sort({ start_time: 1 })
        .limit(10);

    res.json({ events });
});

module.exports = {
    getEvents,
    createEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    importFromMeeting,
    getUpcoming
};
