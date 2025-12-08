require('dotenv').config();
const mongoose = require('mongoose');
const MeetingTranscript = require('../src/models/MeetingTranscript');
const Reminder = require('../src/models/Reminder');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const backfillReminders = async () => {
    await connectDB();

    try {
        const meetings = await MeetingTranscript.find({
            'processed_deadlines.0': { $exists: true }
        });

        console.log(`Found ${meetings.length} meetings with deadlines.`);
        let createdCount = 0;

        for (const meeting of meetings) {
            if (!meeting.processed_deadlines) continue;

            for (const deadline of meeting.processed_deadlines) {
                if (!deadline.deadline || !deadline.task) continue;

                const deadlineDate = new Date(deadline.deadline);

                // Reminder time: 24 hours before deadline
                const reminderDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);

                // Only create if reminder time is in the future
                if (reminderDate > new Date()) {
                    // Check if already exists
                    const existing = await Reminder.findOne({
                        meeting_id: meeting._id,
                        task: deadline.task
                    });

                    if (!existing) {
                        await Reminder.create({
                            user_id: meeting.user_id,
                            meeting_id: meeting._id,
                            task: deadline.task,
                            message: `Reminder: "${deadline.task}" is due tomorrow. Assigned to: ${deadline.actor || 'Unassigned'}`,
                            remind_at: reminderDate,
                            reminder_type: 'EMAIL',
                            status: 'PENDING'
                        });
                        console.log(`✅ Created reminder for "${deadline.task}" (Meeting: ${meeting.title})`);
                        createdCount++;
                    }
                }
            }
        }

        console.log(`\n🎉 Backfill complete. Created ${createdCount} new reminders.`);

    } catch (error) {
        console.error('Backfill error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

backfillReminders();
