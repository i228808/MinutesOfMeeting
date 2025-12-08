const Reminder = require('../models/Reminder');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, paginateResponse, parseDate } = require('../utils/helpers');

/**
 * Create a new reminder
 */
const createReminder = asyncHandler(async (req, res) => {
    const { task, message, remind_at, meeting_id, reminder_type } = req.body;

    if (!task || !remind_at) {
        return res.status(400).json({
            error: 'Missing required fields: task, remind_at'
        });
    }

    const reminderDate = parseDate(remind_at);

    if (!reminderDate || reminderDate <= new Date()) {
        return res.status(400).json({
            error: 'remind_at must be a valid future date'
        });
    }

    const reminder = await Reminder.create({
        user_id: req.user._id,
        meeting_id: meeting_id || null,
        task,
        message: message || `Reminder: ${task}`,
        remind_at: reminderDate,
        reminder_type: reminder_type || 'EMAIL',
        status: 'PENDING'
    });

    res.status(201).json({
        success: true,
        reminder: {
            id: reminder._id,
            task: reminder.task,
            remind_at: reminder.remind_at,
            status: reminder.status
        }
    });
});

/**
 * Get all reminders for user
 */
const getReminders = asyncHandler(async (req, res) => {
    const { page, limit, status, upcoming } = req.query;
    const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

    const query = { user_id: req.user._id };

    if (status) {
        query.status = status.toUpperCase();
    }

    if (upcoming === 'true') {
        query.remind_at = { $gte: new Date() };
        query.status = 'PENDING';
    }

    const [reminders, total] = await Promise.all([
        Reminder.find(query)
            .sort({ remind_at: 1 })
            .skip(skip)
            .limit(limitNum)
            .populate('meeting_id', 'title'),
        Reminder.countDocuments(query)
    ]);

    res.json(paginateResponse(reminders, total, pageNum, limitNum));
});

/**
 * Get single reminder
 */
const getReminder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user_id: req.user._id
    }).populate('meeting_id', 'title summary');

    if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ reminder });
});

/**
 * Update a reminder
 */
const updateReminder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { task, message, remind_at, reminder_type } = req.body;

    const reminder = await Reminder.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.status === 'SENT') {
        return res.status(400).json({ error: 'Cannot update a sent reminder' });
    }

    if (task) reminder.task = task;
    if (message) reminder.message = message;
    if (remind_at) {
        const reminderDate = parseDate(remind_at);
        if (!reminderDate || reminderDate <= new Date()) {
            return res.status(400).json({ error: 'remind_at must be a valid future date' });
        }
        reminder.remind_at = reminderDate;
    }
    if (reminder_type) reminder.reminder_type = reminder_type;

    await reminder.save();

    res.json({
        success: true,
        reminder
    });
});

/**
 * Delete a reminder
 */
const deleteReminder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    await reminder.deleteOne();

    res.json({ success: true, message: 'Reminder deleted' });
});

/**
 * Cancel a reminder
 */
const cancelReminder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
        _id: id,
        user_id: req.user._id
    });

    if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.status === 'SENT') {
        return res.status(400).json({ error: 'Reminder has already been sent' });
    }

    reminder.status = 'CANCELLED';
    await reminder.save();

    res.json({
        success: true,
        message: 'Reminder cancelled'
    });
});

module.exports = {
    createReminder,
    getReminders,
    getReminder,
    updateReminder,
    deleteReminder,
    cancelReminder
};
