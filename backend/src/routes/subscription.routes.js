const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription and billing management
 */

/**
 * @swagger
 * /api/subscriptions/info:
 *   get:
 *     summary: Get current subscription info
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [active, canceled, past_due, trialing]
 *                 tier:
 *                   type: string
 *                   enum: [FREE, PRO, BUSINESS]
 *                 currentPeriodEnd:
 *                   type: integer
 */
router.get('/info', subscriptionController.getSubscriptionInfo);

/**
 * @swagger
 * /api/subscriptions/create:
 *   post:
 *     summary: Create a checkout session for subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priceId
 *             properties:
 *               priceId:
 *                 type: string
 *                 description: Stripe Price ID for the plan
 *     responses:
 *       200:
 *         description: Checkout URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 */
router.post('/create', subscriptionController.createSubscription);

/**
 * @swagger
 * /api/subscriptions/change:
 *   post:
 *     summary: Change subscription tier
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription updated
 */
router.post('/change', subscriptionController.changeTier);

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel subscription
 *     description: Cancels the subscription at the end of the current billing period.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.post('/cancel', subscriptionController.cancelSubscription);

/**
 * @swagger
 * /api/subscriptions/reactivate:
 *   post:
 *     summary: Reactivate cancelled subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription reactivated
 */
router.post('/reactivate', subscriptionController.reactivateSubscription);

/**
 * @swagger
 * /api/subscriptions/portal:
 *   get:
 *     summary: Get Stripe customer portal URL
 *     description: Get a link to the Stripe customer portal for managing billing details.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portal URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 */
router.get('/portal', subscriptionController.getCustomerPortal);

/**
 * @swagger
 * /api/subscriptions/verify:
 *   post:
 *     summary: Verify stripe session
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session verified
 */
router.post('/verify', subscriptionController.verifySession);

module.exports = router;
