const User = require('../models/User');

class LimitService {
    // Tier limits configuration
    static LIMITS = {
        FREE: {
            uploads_per_month: 5,
            audio_minutes_per_month: 10,
            contracts_per_month: 3,
            can_use_extension: false,
            priority_processing: false
        },
        BASIC: {
            uploads_per_month: 20,
            audio_minutes_per_month: 120,
            contracts_per_month: 10,
            can_use_extension: true,
            priority_processing: false
        },
        PREMIUM: {
            uploads_per_month: 50,
            audio_minutes_per_month: 300,
            contracts_per_month: Infinity,
            can_use_extension: true,
            priority_processing: true
        },
        ULTRA: {
            uploads_per_month: Infinity,
            audio_minutes_per_month: Infinity,
            contracts_per_month: Infinity,
            can_use_extension: true,
            priority_processing: true
        }
    };

    /**
     * Get limits for a tier
     */
    static getLimits(tier) {
        return this.LIMITS[tier] || this.LIMITS.FREE;
    }

    /**
     * Check if user can perform an action
     */
    static async canPerformAction(userId, action) {
        const user = await User.findById(userId);
        if (!user) {
            return { allowed: false, reason: 'User not found' };
        }

        // Check if usage needs to be reset (new month)
        await this.checkAndResetUsage(user);

        const limits = this.getLimits(user.subscription_tier);

        switch (action) {
            case 'upload':
                if (user.monthly_uploads >= limits.uploads_per_month) {
                    return {
                        allowed: false,
                        reason: 'Monthly upload limit reached',
                        current: user.monthly_uploads,
                        limit: limits.uploads_per_month,
                        upgrade_prompt: user.subscription_tier !== 'ULTRA'
                    };
                }
                break;

            case 'audio':
                if (user.monthly_audio_minutes >= limits.audio_minutes_per_month) {
                    return {
                        allowed: false,
                        reason: 'Monthly audio limit reached',
                        current: user.monthly_audio_minutes,
                        limit: limits.audio_minutes_per_month,
                        upgrade_prompt: user.subscription_tier !== 'ULTRA'
                    };
                }
                break;

            case 'contract':
                if (user.monthly_contracts >= limits.contracts_per_month) {
                    return {
                        allowed: false,
                        reason: 'Monthly contract limit reached',
                        current: user.monthly_contracts,
                        limit: limits.contracts_per_month,
                        upgrade_prompt: user.subscription_tier !== 'ULTRA'
                    };
                }
                break;

            case 'extension':
                if (!limits.can_use_extension) {
                    return {
                        allowed: false,
                        reason: 'Extension streaming requires BASIC or ULTRA subscription',
                        upgrade_prompt: true
                    };
                }
                break;

            default:
                return { allowed: false, reason: 'Unknown action' };
        }

        return { allowed: true };
    }

    /**
     * Increment usage counter
     */
    static async incrementUsage(userId, type, amount = 1) {
        const user = await User.findById(userId);
        if (!user) return false;

        switch (type) {
            case 'upload':
                user.monthly_uploads += amount;
                break;
            case 'audio':
                user.monthly_audio_minutes += amount;
                break;
            case 'contract':
                user.monthly_contracts += amount;
                break;
        }

        await user.save();
        return true;
    }

    /**
     * Check and reset usage at the start of a new month
     */
    static async checkAndResetUsage(user) {
        const now = new Date();
        const resetDate = new Date(user.usage_reset_date);

        // Check if we're in a new month
        if (now.getMonth() !== resetDate.getMonth() ||
            now.getFullYear() !== resetDate.getFullYear()) {
            user.monthly_uploads = 0;
            user.monthly_audio_minutes = 0;
            user.monthly_contracts = 0;
            user.usage_reset_date = now;
            await user.save();
        }
    }

    /**
     * Get user's current usage stats
     */
    static async getUsageStats(userId) {
        const user = await User.findById(userId);
        if (!user) return null;

        await this.checkAndResetUsage(user);

        const limits = this.getLimits(user.subscription_tier);

        return {
            tier: user.subscription_tier,
            usage: {
                uploads: {
                    used: user.monthly_uploads,
                    limit: limits.uploads_per_month,
                    remaining: Math.max(0, limits.uploads_per_month - user.monthly_uploads)
                },
                audio_minutes: {
                    used: user.monthly_audio_minutes,
                    limit: limits.audio_minutes_per_month,
                    remaining: Math.max(0, limits.audio_minutes_per_month - user.monthly_audio_minutes)
                },
                contracts: {
                    used: user.monthly_contracts,
                    limit: limits.contracts_per_month,
                    remaining: Math.max(0, limits.contracts_per_month - user.monthly_contracts)
                }
            },
            features: {
                can_use_extension: limits.can_use_extension,
                priority_processing: limits.priority_processing
            },
            reset_date: user.usage_reset_date
        };
    }

    /**
     * Get upgrade recommendations based on usage
     */
    static async getUpgradeRecommendation(userId) {
        const user = await User.findById(userId);
        if (!user || user.subscription_tier === 'ULTRA') {
            return null;
        }

        const stats = await this.getUsageStats(userId);

        const usagePercentage = {
            uploads: (stats.usage.uploads.used / stats.usage.uploads.limit) * 100,
            audio: (stats.usage.audio_minutes.used / stats.usage.audio_minutes.limit) * 100,
            contracts: (stats.usage.contracts.used / stats.usage.contracts.limit) * 100
        };

        // Recommend upgrade if any usage is over 80%
        const highUsage = Object.entries(usagePercentage).filter(([, pct]) => pct >= 80);

        if (highUsage.length > 0) {
            const recommendedTier = user.subscription_tier === 'FREE' ? 'BASIC' : 'ULTRA';
            return {
                recommend_upgrade: true,
                current_tier: user.subscription_tier,
                recommended_tier: recommendedTier,
                reasons: highUsage.map(([type, pct]) => `${type} usage at ${pct.toFixed(0)}%`)
            };
        }

        return { recommend_upgrade: false };
    }
}

module.exports = LimitService;
