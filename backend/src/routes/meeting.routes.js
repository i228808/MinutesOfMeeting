const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const meetingController = require('../controllers/meeting.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkLimit } = require('../middleware/tier.middleware');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `meeting-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm',
            'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/m4a',
            'video/webm', 'video/mp4' // Some recorders save as video
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meeting management and audio processing
 */

/**
 * @swagger
 * /api/meetings/upload:
 *   post:
 *     summary: Upload and transcribe audio file
 *     description: Upload an audio file for a meeting. Returns the transcribed text and meeting ID.
 *     tags: [Meetings]
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
 *                 description: Audio file (mp3, wav, webm, etc.)
 *               title:
 *                 type: string
 *                 description: Optional title for the meeting
 *               transcript:
 *                 type: string
 *                 description: Optional text transcript if audio is not provided
 *     responses:
 *       201:
 *         description: Audio uploaded and meeting created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 meeting:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 */
router.post('/upload', upload.single('audio'), meetingController.uploadTranscript);

/**
 * @swagger
 * /api/meetings/analyze:
 *   post:
 *     summary: Analyze audio without saving (dry run)
 *     description: Upload audio or provide text for analysis without saving to database. Useful for previews.
 *     tags: [Meetings]
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
 *                 description: Audio file to analyze
 *               transcript:
 *                 type: string
 *                 description: Raw text transcript to analyze
 *     responses:
 *       200:
 *         description: Analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: string
 *                     actors:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.post('/analyze', upload.single('audio'), meetingController.analyzeOnly);

/**
 * @swagger
 * /api/meetings/confirm:
 *   post:
 *     summary: Confirm meeting details after upload
 *     description: Save the confirmed meeting details after user review. Triggers calendar event creation if deadlines are present.
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - transcript
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Weekly Team Sync"
 *               transcript:
 *                 type: string
 *                 description: Validated transcript text
 *               summary:
 *                 type: string
 *                 description: Validated summary
 *               actors:
 *                 type: array
 *                 items:
 *                   type: object
 *               deadlines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: string
 *                     deadline:
 *                       type: string
 *                       format: date
 *     responses:
 *       201:
 *         description: Meeting confirmed and saved
 */
router.post('/confirm', meetingController.confirmMeeting);

/**
 * @swagger
 * /api/meetings/{id}/process:
 *   post:
 *     summary: Process transcript with LLM
 *     description: Trigger LLM processing for an uploaded meeting. Generates summary, action items, etc.
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting processed
 */
router.post('/:id/process', meetingController.processTranscript);

/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     summary: Get meeting details
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting details
 *   put:
 *     summary: Update meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Meeting updated
 *   delete:
 *     summary: Delete meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting deleted
 */
router.get('/:id', meetingController.getMeeting);
router.put('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: List all meetings
 *     description: Get a paginated list of meetings for the current user.
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for title or summary
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPLOADED, PROCESSING, COMPLETED, FAILED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of meetings
 */
router.get('/', meetingController.listMeetings);

/**
 * @swagger
 * /api/meetings/{id}/export-sheets:
 *   post:
 *     summary: Export meeting data to Google Sheets
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Export successful
 */
router.post('/:id/export-sheets', meetingController.exportToSheets);

/**
 * @swagger
 * /api/meetings/{id}/create-events:
 *   post:
 *     summary: Create Google Calendar events from deadlines
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Events created
 */
router.post('/:id/create-events', meetingController.createCalendarEvents);

module.exports = router;
