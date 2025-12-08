const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { notificationService } = require('../services');

/**
 * Start the reminder cron job
 * Runs every minute to check for pending reminders
 */
const startReminderCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            await processReminders();
        } catch (error) {
            console.error('Reminder cron error:', error);
        }
    });

    console.log('📅 Reminder cron job initialized');
};

/**
 * Process pending reminders that are due
 */
const processReminders = async () => {
    const now = new Date();

    // Find reminders that are due (within the last minute) and pending
    const dueReminders = await Reminder.find({
        status: 'PENDING',
        remind_at: {
            $lte: now,
            $gte: new Date(now.getTime() - 60000) // Within last minute
        }
    }).populate('user_id');

    for (const reminder of dueReminders) {
        try {
            await sendReminder(reminder);
        } catch (error) {
            console.error(`Failed to send reminder ${reminder._id}:`, error);

            reminder.status = 'FAILED';
            reminder.error_message = error.message;
            await reminder.save();
        }
    }

    // Also check for overdue reminders (missed by cron)
    const overdueReminders = await Reminder.find({
        status: 'PENDING',
        remind_at: {
            $lt: new Date(now.getTime() - 60000) // More than 1 minute ago
        }
    }).populate('user_id');

    for (const reminder of overdueReminders) {
        try {
            await sendReminder(reminder);
        } catch (error) {
            console.error(`Failed to send overdue reminder ${reminder._id}:`, error);

            reminder.status = 'FAILED';
            reminder.error_message = error.message;
            await reminder.save();
        }
    }
};

/**
 * Send a single reminder notification
 */
const sendReminder = async (reminder) => {
    const user = reminder.user_id;

    if (!user) {
        throw new Error('User not found for reminder');
    }

    // Send based on reminder type
    switch (reminder.reminder_type) {
        case 'EMAIL':
        case 'BOTH':
            await notificationService.sendReminderEmail(user, reminder);
            break;
        case 'PUSH':
            // Push notifications would be implemented here
            console.log(`Push notification for reminder ${reminder._id}: ${reminder.task}`);
            break;
    }

    // Update reminder status
    reminder.status = 'SENT';
    reminder.sent_at = new Date();
    await reminder.save();

    console.log(`✅ Reminder sent: ${reminder.task} to ${user.email}`);

    // Handle recurring reminders
    if (reminder.is_recurring && reminder.recurrence_pattern) {
        await createNextRecurrence(reminder);
    }
};

/**
 * Create next occurrence for recurring reminders
 */
const createNextRecurrence = async (reminder) => {
    let nextDate = new Date(reminder.remind_at);

    switch (reminder.recurrence_pattern) {
        case 'DAILY':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'WEEKLY':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'MONTHLY':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        default:
            return; // No valid pattern
    }

    // Create new reminder for next occurrence
    await Reminder.create({
        user_id: reminder.user_id._id || reminder.user_id,
        meeting_id: reminder.meeting_id,
        task: reminder.task,
        message: reminder.message,
        remind_at: nextDate,
        reminder_type: reminder.reminder_type,
        status: 'PENDING',
        is_recurring: true,
        recurrence_pattern: reminder.recurrence_pattern
    });

    console.log(`📅 Created next recurring reminder for ${nextDate.toISOString()}`);
};

/**
 * Manually trigger reminder processing (for testing)
 */
const triggerReminderProcessing = async () => {
    console.log('Manually triggering reminder processing...');
    await processReminders();
};

module.exports = {
    startReminderCron,
    processReminders,
    triggerReminderProcessing
};
