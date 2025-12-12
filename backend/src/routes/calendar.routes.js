const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: Internal Calendar Management
 */

/**
 * @swagger
 * /api/calendar/events:
 *   get:
 *     summary: List calendar events
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *   post:
 *     summary: Create calendar event
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - start
 *               - end
 *             properties:
 *               title:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Event created
 */
router.get('/events', calendarController.getEvents);
router.post('/events', calendarController.createEvent);

/**
 * @swagger
 * /api/calendar/upcoming:
 *   get:
 *     summary: Get upcoming events
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming events
 */
router.get('/upcoming', calendarController.getUpcoming);

/**
 * @swagger
 * /api/calendar/events/{id}:
 *   get:
 *     summary: Get event details
 *     tags: [Calendar]
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
 *         description: Event details
 *   put:
 *     summary: Update event
 *     tags: [Calendar]
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
 *     responses:
 *       200:
 *         description: Event updated
 *   delete:
 *     summary: Delete event
 *     tags: [Calendar]
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
 *         description: Event deleted
 */
router.get('/events/:id', calendarController.getEvent);
router.put('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

/**
 * @swagger
 * /api/calendar/import-meeting:
 *   post:
 *     summary: Import deadlines from meeting
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meetingId
 *             properties:
 *               meetingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imported successfully
 */
router.post('/import-meeting', calendarController.importFromMeeting);

module.exports = router;
