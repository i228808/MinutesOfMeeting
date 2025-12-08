const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminder.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Reminder routes
router.post('/create', reminderController.createReminder);
router.get('/', reminderController.getReminders);
router.get('/:id', reminderController.getReminder);
router.put('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);
router.post('/:id/cancel', reminderController.cancelReminder);

module.exports = router;
