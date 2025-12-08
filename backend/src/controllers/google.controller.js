const CalendarEvent = require('../models/CalendarEvent');
const { asyncHandler } = require('../middleware/error.middleware');
const { googleService } = require('../services');
const { paginate, paginateResponse } = require('../utils/helpers');

/**
 * Create a row in Google Sheets
 */
const createSheetRow = asyncHandler(async (req, res) => {
    const { spreadsheet_id, sheet_name, values } = req.body;

    if (!spreadsheet_id || !sheet_name || !values) {
        return res.status(400).json({
            error: 'Missing required fields: spreadsheet_id, sheet_name, values'
        });
    }

    const result = await googleService.appendRow(
        req.user,
        spreadsheet_id,
        sheet_name,
        values
    );

    res.json({
        success: true,
        result
    });
});

/**
 * Create a new spreadsheet
 */
const createSpreadsheet = asyncHandler(async (req, res) => {
    const { title } = req.body;

    const spreadsheet = await googleService.createSpreadsheet(
        req.user,
        title || `Spreadsheet - ${new Date().toLocaleDateString()}`
    );

    res.json({
        success: true,
        spreadsheet: {
            id: spreadsheet.spreadsheetId,
            url: spreadsheet.spreadsheetUrl,
            title: spreadsheet.properties.title
        }
    });
});

/**
 * Create a calendar event
 */
const createCalendarEvent = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        start_time,
        end_time,
        attendees,
        location,
        meeting_id
    } = req.body;

    if (!title || !start_time || !end_time) {
        return res.status(400).json({
            error: 'Missing required fields: title, start_time, end_time'
        });
    }

    const event = await googleService.createCalendarEvent(req.user, {
        title,
        description: description || '',
        startTime: start_time,
        endTime: end_time,
        attendees: attendees || [],
        location: location || ''
    });

    // Save to local database
    const calendarEvent = await CalendarEvent.create({
        user_id: req.user._id,
        meeting_id: meeting_id || null,
        google_event_id: event.id,
        title,
        description: description || '',
        deadline: new Date(start_time),
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        attendees: (attendees || []).map(email => ({ email })),
        location: location || '',
        status: 'SCHEDULED'
    });

    res.json({
        success: true,
        event: {
            id: calendarEvent._id,
            google_event_id: event.id,
            title,
            html_link: event.htmlLink,
            start_time,
            end_time
        }
    });
});

/**
 * List calendar events
 */
const listCalendarEvents = asyncHandler(async (req, res) => {
    const { page, limit, from_date, max_results } = req.query;
    const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

    // Fetch from Google Calendar
    const googleEvents = await googleService.listCalendarEvents(req.user, {
        timeMin: from_date || new Date().toISOString(),
        maxResults: max_results || 50
    });

    // Also get our locally cached events
    const query = {
        user_id: req.user._id,
        deadline: { $gte: from_date ? new Date(from_date) : new Date() }
    };

    const [localEvents, total] = await Promise.all([
        CalendarEvent.find(query)
            .sort({ deadline: 1 })
            .skip(skip)
            .limit(limitNum),
        CalendarEvent.countDocuments(query)
    ]);

    res.json({
        google_events: googleEvents.map(e => ({
            id: e.id,
            title: e.summary,
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
            html_link: e.htmlLink,
            status: e.status
        })),
        local_events: paginateResponse(localEvents, total, pageNum, limitNum)
    });
});

/**
 * Delete a calendar event
 */
const deleteCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    // Delete from Google Calendar
    try {
        await googleService.deleteCalendarEvent(req.user, event.google_event_id);
    } catch (error) {
        console.error('Failed to delete from Google Calendar:', error);
        // Continue with local deletion even if Google delete fails
    }

    await event.deleteOne();

    res.json({ success: true, message: 'Event deleted' });
});

/**
 * Update a calendar event
 */
const updateCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, start_time, end_time, location } = req.body;

    const event = await CalendarEvent.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    const updates = {};
    if (title) updates.summary = title;
    if (description) updates.description = description;
    if (start_time) updates.start = { dateTime: new Date(start_time).toISOString() };
    if (end_time) updates.end = { dateTime: new Date(end_time).toISOString() };
    if (location) updates.location = location;

    // Update in Google Calendar
    const updatedGoogleEvent = await googleService.updateCalendarEvent(
        req.user,
        event.google_event_id,
        updates
    );

    // Update local record
    if (title) event.title = title;
    if (description) event.description = description;
    if (start_time) {
        event.start_time = new Date(start_time);
        event.deadline = new Date(start_time);
    }
    if (end_time) event.end_time = new Date(end_time);
    if (location) event.location = location;

    await event.save();

    res.json({
        success: true,
        event: {
            id: event._id,
            google_event_id: event.google_event_id,
            title: event.title,
            html_link: updatedGoogleEvent.htmlLink
        }
    });
});

module.exports = {
    createSheetRow,
    createSpreadsheet,
    createCalendarEvent,
    listCalendarEvents,
    deleteCalendarEvent,
    updateCalendarEvent
};
