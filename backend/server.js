require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initializeSocket } = require('./src/config/socket');
const { startReminderCron } = require('./src/jobs/reminder.cron');
const initRagCron = require('./src/cron/rag.cron');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO for real-time streaming
initializeSocket(server);

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected successfully');

        // Start reminder cron job
        startReminderCron();
        console.log('✅ Reminder cron job started');

        // Start RAG training cron job
        initRagCron();
        console.log('✅ Weekly RAG training cron job started');

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV}`);
            console.log(`🌍 CLIENT_URL: ${process.env.CLIENT_URL}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});

module.exports = { server, startServer };
