const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { generateToken } = require('../utils/jwt');
const { asyncHandler, APIError } = require('../middleware/error.middleware');

/**
 * Register a new user with email/password
 */
/**
 * Register a new user with email/password
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        throw new APIError('Name, email, and password are required', 400);
    }

    if (password.length < 8) {
        throw new APIError('Password must be at least 8 characters', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new APIError('An account with this email already exists', 409);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user (unverified)
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        auth_provider: 'local',
        email_verified: false,
        verification_otp: otp,
        otp_expires: otpExpires
    });

    // Create FREE subscription
    await Subscription.create({
        user_id: user._id,
        tier: 'FREE',
        status: 'ACTIVE'
    });

    // Send OTP email
    const notificationService = require('../services/notification.service');
    await notificationService.sendOTP(email, otp);

    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification code.',
        need_verification: true,
        email: user.email
    });
});

/**
 * Verify Email with OTP
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new APIError('Email and OTP are required', 400);
    }

    const user = await User.findOne({
        email: email.toLowerCase()
    }).select('+verification_otp +otp_expires');

    if (!user) {
        throw new APIError('User not found', 404);
    }

    if (user.email_verified) {
        return res.json({ success: true, message: 'Email already verified' });
    }

    if (!user.verification_otp || !user.otp_expires) {
        throw new APIError('No verification pending', 400);
    }

    if (user.verification_otp !== otp) {
        throw new APIError('Invalid verification code', 400);
    }

    if (user.otp_expires < new Date()) {
        throw new APIError('Verification code has expired', 400);
    }

    // Activate user
    user.email_verified = true;
    user.verification_otp = undefined;
    user.otp_expires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
        success: true,
        message: 'Email verified successfully',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            subscription_tier: user.subscription_tier
        }
    });
});

/**
 * Resend OTP
 */
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new APIError('Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new APIError('User not found', 404);
    }

    if (user.email_verified) {
        throw new APIError('Email is already verified', 400);
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verification_otp = otp;
    user.otp_expires = otpExpires;
    await user.save();

    // Send email
    const notificationService = require('../services/notification.service');
    await notificationService.sendOTP(email, otp);

    res.json({
        success: true,
        message: 'Verification code resent'
    });
});

/**
 * Login with email/password
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        throw new APIError('Email and password are required', 400);
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        throw new APIError('Invalid email or password', 401);
    }

    // Check if user uses OAuth
    if (user.auth_provider === 'google' && !user.password) {
        throw new APIError('This account uses Google Sign-In. Please login with Google.', 400);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new APIError('Invalid email or password', 401);
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profile_image: user.profile_image,
            subscription_tier: user.subscription_tier
        }
    });
});

/**
 * Initiate Google OAuth login
 */
const googleAuth = passport.authenticate('google', {
    scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file'
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
            auth_provider: user.auth_provider,
            email_verified: user.email_verified,
            data_usage_consent: user.data_usage_consent,
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

    if (req.body.data_usage_consent !== undefined) {
        user.data_usage_consent = req.body.data_usage_consent;
    }

    await user.save();

    res.json({
        success: true,
        user: {
            name: user.name,
            email: user.email,
            profile_image: user.profile_image,
            data_usage_consent: user.data_usage_consent
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
    register,
    login,
    verifyEmail,
    resendOTP,
    googleAuth,
    googleCallback,
    getCurrentUser,
    logout,
    refreshToken,
    updateProfile,
    deleteAccount
};
