const express = require('express');
const router = express.Router();
const googleController = require('../controllers/google.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Google Sheets routes
router.post('/sheets/create', googleController.createSpreadsheet);
router.post('/sheets/create-row', googleController.createSheetRow);

// Google Calendar routes
router.post('/calendar/create-event', googleController.createCalendarEvent);
router.get('/calendar/list', googleController.listCalendarEvents);
router.put('/calendar/:id', googleController.updateCalendarEvent);
router.delete('/calendar/:id', googleController.deleteCalendarEvent);

module.exports = router;
