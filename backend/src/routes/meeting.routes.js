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

// Meeting routes
router.post('/upload', upload.single('audio'), meetingController.uploadTranscript);
router.post('/analyze', upload.single('audio'), meetingController.analyzeOnly);
router.post('/confirm', meetingController.confirmMeeting);
router.post('/:id/process', meetingController.processTranscript);
router.get('/:id', meetingController.getMeeting);
router.get('/', meetingController.listMeetings);
router.delete('/:id', meetingController.deleteMeeting);

// Google integrations for meetings
router.post('/:id/export-sheets', meetingController.exportToSheets);
router.post('/:id/create-events', meetingController.createCalendarEvents);

module.exports = router;
