const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminder.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Reminder management
 */

/**
 * @swagger
 * /api/reminders/create:
 *   post:
 *     summary: Create a new reminder
 *     tags: [Reminders]
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
 *               - dateTime
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Follow up with client"
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T10:00:00Z"
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reminder created
 */
router.post('/create', reminderController.createReminder);

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: List all reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reminders
 */
router.get('/', reminderController.getReminders);

/**
 * @swagger
 * /api/reminders/{id}:
 *   get:
 *     summary: Get reminder details
 *     tags: [Reminders]
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
 *         description: Reminder details
 *   put:
 *     summary: Update reminder
 *     tags: [Reminders]
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
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Reminder updated
 *   delete:
 *     summary: Delete reminder
 *     tags: [Reminders]
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
 *         description: Reminder deleted
 */
router.get('/:id', reminderController.getReminder);
router.put('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

/**
 * @swagger
 * /api/reminders/{id}/cancel:
 *   post:
 *     summary: Cancel a reminder
 *     tags: [Reminders]
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
 *         description: Reminder cancelled
 */
router.post('/:id/cancel', reminderController.cancelReminder);

module.exports = router;
