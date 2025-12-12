const express = require('express');
const router = express.Router();
const googleController = require('../controllers/google.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Google
 *   description: Google Integrations (Sheets, Calendar)
 */

/**
 * @swagger
 * /api/google/sheets/create:
 *   post:
 *     summary: Create a new Google Spreadsheet
 *     tags: [Google]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Project Roadmap"
 *     responses:
 *       200:
 *         description: Spreadsheet created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 spreadsheetId:
 *                   type: string
 *                 spreadsheetUrl:
 *                   type: string
 */
router.post('/sheets/create', googleController.createSpreadsheet);

/**
 * @swagger
 * /api/google/sheets/create-row:
 *   post:
 *     summary: Append row to sheet
 *     tags: [Google]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spreadsheetId
 *               - values
 *             properties:
 *               spreadsheetId:
 *                 type: string
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Item 1", "Active", "2024-01-01"]
 *     responses:
 *       200:
 *         description: Row added
 */
router.post('/sheets/create-row', googleController.createSheetRow);

/**
 * @swagger
 * /api/google/calendar/create-event:
 *   post:
 *     summary: Create Google Calendar event
 *     tags: [Google]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Meeting with Client"
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T14:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T15:00:00Z"
 *     responses:
 *       200:
 *         description: Event created
 */
router.post('/calendar/create-event', googleController.createCalendarEvent);

/**
 * @swagger
 * /api/google/calendar/list:
 *   get:
 *     summary: List calendar events
 *     tags: [Google]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/calendar/list', googleController.listCalendarEvents);

/**
 * @swagger
 * /api/google/calendar/{id}:
 *   put:
 *     summary: Update calendar event
 *     tags: [Google]
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
 *     summary: Delete calendar event
 *     tags: [Google]
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
router.put('/calendar/:id', googleController.updateCalendarEvent);
router.delete('/calendar/:id', googleController.deleteCalendarEvent);

module.exports = router;
