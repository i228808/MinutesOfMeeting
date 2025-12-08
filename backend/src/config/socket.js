const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*', // Allow extension to connect
            methods: ['GET', 'POST'],
            credentials: true
        },
        maxHttpBufferSize: 10e6 // 10MB for audio chunks
    });

    // Authentication middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('User not found'));
            }

            // Check if user has streaming access (BASIC, PREMIUM, or ULTRA tier)
            if (user.subscription_tier === 'FREE') {
                return next(new Error('Streaming requires BASIC, PREMIUM, or ULTRA subscription'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    // Handle connections
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.email}`);

        // Join user to their personal room
        socket.join(`user:${socket.user.id}`);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.email}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

module.exports = { initializeSocket, getIO };
