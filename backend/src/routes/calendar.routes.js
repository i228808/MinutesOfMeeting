const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Calendar event routes
router.get('/events', calendarController.getEvents);
router.post('/events', calendarController.createEvent);
router.get('/upcoming', calendarController.getUpcoming);
router.get('/events/:id', calendarController.getEvent);
router.put('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

// Import deadlines from meeting
router.post('/import-meeting', calendarController.importFromMeeting);

module.exports = router;
