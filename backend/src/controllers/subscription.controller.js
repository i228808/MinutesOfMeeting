const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/error.middleware');
const { notificationService, LimitService } = require('../services');

/**
 * Helper: Resolve Price ID from Product ID if needed
 */
const getPriceId = async (tier) => {
    let id;
    // Support both naming conventions or just check the value
    if (tier === 'BASIC') id = process.env.STRIPE_PRICE_BASIC || process.env.STRIPE_PRODUCT_BASIC;
    else if (tier === 'PREMIUM') id = process.env.STRIPE_PRICE_PREMIUM || process.env.STRIPE_PRODUCT_PREMIUM;
    else if (tier === 'ULTRA') id = process.env.STRIPE_PRICE_ULTRA || process.env.STRIPE_PRODUCT_ULTRA;

    if (!id) throw new Error(`Configuration missing for tier: ${tier}`);

    // If it's a Product ID (prod_), fetch the price
    if (id.startsWith('prod_')) {
        try {
            const prices = await stripe.prices.list({
                product: id,
                active: true,
                limit: 1
            });

            if (prices.data.length === 0) {
                throw new Error(`No active price found for product ${id}`);
            }
            return prices.data[0].id;
        } catch (error) {
            console.error('Error fetching price for product:', error);
            throw error;
        }
    }

    // Otherwise assume it's a price ID
    return id;
};

/**
 * Get subscription information
 */
const getSubscriptionInfo = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({ user_id: req.user._id });
    const usageStats = await LimitService.getUsageStats(req.user._id);

    res.json({
        subscription: subscription || {
            tier: 'FREE',
            status: 'ACTIVE',
            limits: LimitService.getLimits('FREE')
        },
        usage: usageStats
    });
});

/**
 * Create Stripe checkout session for subscription
 */
const createSubscription = asyncHandler(async (req, res) => {
    const { tier } = req.body;

    if (!['BASIC', 'PREMIUM', 'ULTRA'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier. Choose BASIC, PREMIUM, or ULTRA' });
    }

    const priceId = await getPriceId(tier);

    // Get or create Stripe customer
    let subscription = await Subscription.findOne({ user_id: req.user._id });
    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: req.user.email,
            name: req.user.name,
            metadata: { user_id: req.user._id.toString() }
        });
        customerId = customer.id;

        if (!subscription) {
            subscription = await Subscription.create({
                user_id: req.user._id,
                tier: 'FREE',
                stripe_customer_id: customerId,
                status: 'ACTIVE'
            });
        } else {
            subscription.stripe_customer_id = customerId;
            await subscription.save();
        }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
            price: priceId,
            quantity: 1
        }],
        success_url: `${process.env.CLIENT_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/dashboard/subscription?canceled=true`,
        metadata: {
            user_id: req.user._id.toString(),
            tier
        }
    });

    res.json({
        checkout_url: session.url,
        session_id: session.id
    });
});

/**
 * Change subscription tier
 */
const changeTier = asyncHandler(async (req, res) => {
    const { tier } = req.body;

    if (!['FREE', 'BASIC', 'PREMIUM', 'ULTRA'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier' });
    }

    const subscription = await Subscription.findOne({ user_id: req.user._id });

    if (!subscription) {
        return res.status(404).json({ error: 'No subscription found' });
    }

    // If switching to FREE, cancel current subscription
    if (tier === 'FREE') {
        return cancelSubscription(req, res);
    }

    // If upgrading/changing paid tier
    if (subscription.stripe_subscription_id) {
        // Has existing subscription -> Update it
        const priceId = await getPriceId(tier);

        const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );

        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
            items: [{
                id: stripeSubscription.items.data[0].id,
                price: priceId
            }],
            proration_behavior: 'create_prorations'
        });

        // Update local records immediately (webhook will also confirm)
        subscription.tier = tier;
        await subscription.save();

        req.user.subscription_tier = tier;
        await req.user.save();

        try {
            await notificationService.sendSubscriptionEmail(req.user, tier, 'changed');
        } catch (error) {
            console.error('Failed to send subscription email:', error);
        }

        return res.json({
            success: true,
            subscription: {
                tier: subscription.tier,
                status: subscription.status,
                limits: subscription.limits
            }
        });
    } else {
        // No existing subscription -> Create new one (Checkout)
        return createSubscription(req, res);
    }
});

/**
 * Cancel subscription
 */
const cancelSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({ user_id: req.user._id });

    if (!subscription?.stripe_subscription_id) {
        return res.status(400).json({ error: 'No active subscription to cancel' });
    }

    // Cancel at period end (user keeps access until renewal date)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
    });

    subscription.cancel_at_period_end = true;
    await subscription.save();

    res.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period',
        cancel_at: subscription.renewal_date
    });
});

/**
 * Reactivate cancelled subscription
 */
const reactivateSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({ user_id: req.user._id });

    if (!subscription?.stripe_subscription_id || !subscription.cancel_at_period_end) {
        return res.status(400).json({ error: 'No cancelled subscription to reactivate' });
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false
    });

    subscription.cancel_at_period_end = false;
    await subscription.save();

    res.json({
        success: true,
        message: 'Subscription reactivated successfully'
    });
});

/**
 * Get Stripe customer portal URL
 */
const getCustomerPortal = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({ user_id: req.user._id });

    if (!subscription?.stripe_customer_id) {
        return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.CLIENT_URL}/settings/subscription`
    });

    res.json({ portal_url: session.url });
});

/**
 * Verify checkout session manually (fallback for webhooks)
 */
const verifySession = asyncHandler(async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session && session.payment_status === 'paid') {
        // Reuse webhook logic to update DB
        await handleCheckoutCompleted(session);
        return res.json({ success: true, tier: session.metadata.tier });
    }

    res.json({ success: false });
});

/**
 * Handle Stripe webhook events
 */
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            await handleCheckoutCompleted(session);
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            await handleSubscriptionUpdated(subscription);
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            await handleSubscriptionDeleted(subscription);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            await handlePaymentFailed(invoice);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};

// Webhook helper functions
async function handleCheckoutCompleted(session) {
    const userId = session.metadata.user_id;
    const tier = session.metadata.tier;

    const subscription = await Subscription.findOne({ user_id: userId });
    if (subscription) {
        subscription.tier = tier;
        subscription.stripe_subscription_id = session.subscription;
        subscription.status = 'ACTIVE';
        subscription.renewal_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await subscription.save();
    }

    const user = await User.findById(userId);
    if (user) {
        user.subscription_tier = tier;
        await user.save();

        try {
            await notificationService.sendSubscriptionEmail(user, tier, 'upgraded');
        } catch (error) {
            console.error('Failed to send subscription email:', error);
        }
    }
}

async function handleSubscriptionUpdated(stripeSubscription) {
    const subscription = await Subscription.findOne({
        stripe_subscription_id: stripeSubscription.id
    });

    if (subscription) {
        subscription.status = stripeSubscription.status === 'active' ? 'ACTIVE' :
            stripeSubscription.status === 'past_due' ? 'PAST_DUE' :
                'INACTIVE';
        subscription.renewal_date = new Date(stripeSubscription.current_period_end * 1000);
        subscription.cancel_at_period_end = stripeSubscription.cancel_at_period_end;
        await subscription.save();
    }
}

async function handleSubscriptionDeleted(stripeSubscription) {
    const subscription = await Subscription.findOne({
        stripe_subscription_id: stripeSubscription.id
    });

    if (subscription) {
        subscription.tier = 'FREE';
        subscription.status = 'INACTIVE';
        subscription.stripe_subscription_id = null;
        await subscription.save();

        const user = await User.findById(subscription.user_id);
        if (user) {
            user.subscription_tier = 'FREE';
            await user.save();
        }
    }
}

async function handlePaymentFailed(invoice) {
    const subscription = await Subscription.findOne({
        stripe_customer_id: invoice.customer
    });

    if (subscription) {
        subscription.status = 'PAST_DUE';
        await subscription.save();
    }
}

module.exports = {
    getSubscriptionInfo,
    createSubscription,
    changeTier,
    cancelSubscription,
    reactivateSubscription,
    getCustomerPortal,
    handleStripeWebhook,
    verifySession
};
