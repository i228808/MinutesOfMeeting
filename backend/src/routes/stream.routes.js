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

/**
 * @swagger
 * tags:
 *   name: Realtime Stream
 *   description: Real-time audio streaming from extension
 */

/**
 * @swagger
 * /api/realtime/stream/start:
 *   post:
 *     summary: Start a streaming session
 *     tags: [Realtime Stream]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meeting_url:
 *                 type: string
 *               platform:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session_id:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post('/stream/start', requireExtensionAccess, streamController.startSession);

/**
 * @swagger
 * /api/realtime/stream/chunk:
 *   post:
 *     summary: Upload audio chunk
 *     tags: [Realtime Stream]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *               session_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chunk received
 */
router.post('/stream/chunk', requireExtensionAccess, upload.single('audio'), streamController.processChunk);

/**
 * @swagger
 * /api/realtime/stream/end:
 *   post:
 *     summary: End streaming session
 *     tags: [Realtime Stream]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session ended
 */
router.post('/stream/end', requireExtensionAccess, streamController.endSession);

/**
 * @swagger
 * /api/realtime/stream/{session_id}/status:
 *   get:
 *     summary: Get session status
 *     tags: [Realtime Stream]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session status
 */
router.get('/stream/:session_id/status', streamController.getSessionStatus);

/**
 * @swagger
 * /api/realtime/sessions:
 *   get:
 *     summary: List streaming sessions
 *     tags: [Realtime Stream]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/sessions', streamController.listSessions);

module.exports = router;
