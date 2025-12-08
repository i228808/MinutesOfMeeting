const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamController = require('../controllers/stream.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireExtensionAccess } = require('../middleware/tier.middleware');

// Configure multer for audio chunk uploads (memory storage for streaming)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max per chunk
    }
});

// All routes require authentication and extension access
router.use(authenticate);

// Stream routes
router.post('/stream/start', requireExtensionAccess, streamController.startSession);
router.post('/stream/chunk', requireExtensionAccess, upload.single('audio'), streamController.processChunk);
router.post('/stream/end', requireExtensionAccess, streamController.endSession);
router.get('/stream/:session_id/status', streamController.getSessionStatus);
router.get('/sessions', streamController.listSessions);

module.exports = router;
