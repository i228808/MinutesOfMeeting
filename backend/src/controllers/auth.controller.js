const passport = require('passport');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { generateToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Initiate Google OAuth login
 */
const googleAuth = passport.authenticate('google', {
    scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/spreadsheets'
    ],
    accessType: 'offline',
    prompt: 'consent'
});

/**
 * Handle Google OAuth callback
 */
const googleCallback = [
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
        session: false
    }),
    asyncHandler(async (req, res) => {
        const user = req.user;

        // Generate JWT
        const token = generateToken(user._id);

        // Create subscription record if it doesn't exist
        const existingSubscription = await Subscription.findOne({ user_id: user._id });
        if (!existingSubscription) {
            await Subscription.create({
                user_id: user._id,
                tier: 'FREE',
                status: 'ACTIVE'
            });
        }

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    })
];

/**
 * Get current authenticated user
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-google_access_token -google_refresh_token');

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Get subscription info
    const subscription = await Subscription.findOne({ user_id: user._id });

    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profile_image: user.profile_image,
            subscription_tier: user.subscription_tier,
            created_at: user.created_at
        },
        subscription: subscription ? {
            tier: subscription.tier,
            status: subscription.status,
            renewal_date: subscription.renewal_date,
            limits: subscription.limits
        } : null,
        usage: {
            monthly_uploads: user.monthly_uploads,
            monthly_audio_minutes: user.monthly_audio_minutes,
            monthly_contracts: user.monthly_contracts,
            usage_reset_date: user.usage_reset_date
        }
    });
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
    // Clear cookie if using cookies
    res.clearCookie('token');

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * Refresh user token
 */
const refreshToken = asyncHandler(async (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    res.json({
        token,
        expires_in: process.env.JWT_EXPIRES_IN || '7d'
    });
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const user = await User.findById(req.user._id);

    if (name) {
        user.name = name;
    }

    await user.save();

    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profile_image: user.profile_image
        }
    });
});

/**
 * Delete user account
 */
const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Delete subscription
    await Subscription.deleteOne({ user_id: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.clearCookie('token');

    res.json({
        success: true,
        message: 'Account deleted successfully'
    });
});

module.exports = {
    googleAuth,
    googleCallback,
    getCurrentUser,
    logout,
    refreshToken,
    updateProfile,
    deleteAccount
};
