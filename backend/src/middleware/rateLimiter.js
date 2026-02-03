const rateLimit = require('express-rate-limit');

/**
 * Global API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the request limit. Please try again later.'
    }
});

/**
 * Strict Auth Rate Limiter
 * 5 requests per 15 minutes per IP
 * Protects login, register, verify endpoints from brute force
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts',
        message: 'Too many attempts. Please try again in 15 minutes.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter
};
