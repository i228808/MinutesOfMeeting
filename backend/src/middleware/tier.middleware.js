const LimitService = require('../services/limit.service');

/**
 * Middleware to check subscription tier for feature access
 */
const requireTier = (...allowedTiers) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access this resource'
            });
        }

        if (!allowedTiers.includes(req.user.subscription_tier)) {
            return res.status(403).json({
                error: 'Upgrade required',
                message: `This feature requires ${allowedTiers.join(' or ')} subscription`,
                current_tier: req.user.subscription_tier,
                required_tiers: allowedTiers
            });
        }

        next();
    };
};

/**
 * Middleware to check and enforce usage limits
 */
const checkLimit = (action) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        try {
            const result = await LimitService.canPerformAction(req.user._id, action);

            if (!result.allowed) {
                return res.status(429).json({
                    error: 'Limit exceeded',
                    message: result.reason,
                    details: {
                        current: result.current,
                        limit: result.limit,
                        upgrade_prompt: result.upgrade_prompt
                    }
                });
            }

            // Attach limit check result for potential use in controller
            req.limitCheck = result;
            next();
        } catch (error) {
            console.error('Limit check error:', error);
            next(error);
        }
    };
};

/**
 * Middleware to check if user can use extension streaming
 */
const requireExtensionAccess = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    const limits = LimitService.getLimits(req.user.subscription_tier);

    if (!limits.can_use_extension) {
        return res.status(403).json({
            error: 'Feature not available',
            message: 'Real-time extension streaming requires BASIC or ULTRA subscription',
            current_tier: req.user.subscription_tier,
            required_tiers: ['BASIC', 'ULTRA']
        });
    }

    next();
};

/**
 * Add usage stats to response (useful for frontend)
 */
const attachUsageStats = async (req, res, next) => {
    if (req.user) {
        try {
            req.usageStats = await LimitService.getUsageStats(req.user._id);
        } catch (error) {
            console.error('Error attaching usage stats:', error);
        }
    }
    next();
};

module.exports = {
    requireTier,
    checkLimit,
    requireExtensionAccess,
    attachUsageStats
};
