const { Worker } = require('bullmq');
const connection = require('../config/redis');
const MeetingTranscript = require('../models/MeetingTranscript');
const llmService = require('../services/llm.service');

const meetingWorker = new Worker('meeting-processing', async (job) => {
    const { meetingId, transcript } = job.data;
    console.log(`[Worker] Processing meeting ${meetingId}...`);

    try {
        const meeting = await MeetingTranscript.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        meeting.status = 'PROCESSING';
        await meeting.save();

        // Fetch Team Context if applicable
        let teamMembers = [];
        if (meeting.team_id) {
            const Team = require('../models/Team');
            const team = await Team.findById(meeting.team_id).populate('members', 'name email _id');
            if (team && team.members) {
                teamMembers = team.members.map(m => ({
                    name: m.name,
                    id: m._id.toString(),
                    email: m.email
                }));
            }
            console.log(`[Worker] Loaded context for ${teamMembers.length} team members`);
        }

        // Perform LLM analysis
        const analysis = await llmService.analyzeTranscript(transcript, teamMembers);

        // Update meeting with results
        meeting.summary = analysis.summary;
        meeting.action_items = analysis.action_items || [];
        meeting.key_decisions = analysis.key_decisions || [];
        meeting.processed_deadlines = analysis.deadlines || [];
        meeting.status = 'COMPLETED';
        await meeting.save();

        console.log(`[Worker] Configuration complete for meeting ${meetingId}`);
        return { success: true, meetingId };
    } catch (error) {
        console.error(`[Worker] Failed to process meeting ${meetingId}:`, error);

        // Update status to failed on final attempt
        if (job.attemptsMade >= job.opts.attempts - 1) {
            await MeetingTranscript.findByIdAndUpdate(meetingId, {
                status: 'FAILED',
                error_message: error.message
            });
        }

        throw error;
    }
}, {
    connection,
    concurrency: 5 // Process up to 5 meetings concurrently
});

meetingWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
});

meetingWorker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job.id} failed with ${err.message}`);
});

module.exports = meetingWorker;
