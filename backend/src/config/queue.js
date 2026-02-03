const { Queue } = require('bullmq');
const connection = require('./redis');

// Create queues
const meetingQueue = new Queue('meeting-processing', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

module.exports = {
    meetingQueue
};
