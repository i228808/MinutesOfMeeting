const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Subscription management
router.get('/info', subscriptionController.getSubscriptionInfo);
router.post('/create', subscriptionController.createSubscription);
router.post('/change', subscriptionController.changeTier);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/reactivate', subscriptionController.reactivateSubscription);
router.get('/portal', subscriptionController.getCustomerPortal);
router.post('/verify', subscriptionController.verifySession);

module.exports = router;
