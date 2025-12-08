const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    // Password for email/password auth (optional if using OAuth)
    password: {
        type: String,
        default: null,
        select: false // Don't include password in queries by default
    },
    // Auth provider - 'local' for email/password, 'google' for OAuth
    auth_provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    oauth_id: {
        type: String,
        default: null,
        sparse: true
    },
    profile_image: {
        type: String,
        default: null
    },
    subscription_tier: {
        type: String,
        enum: ['FREE', 'BASIC', 'PREMIUM', 'ULTRA'],
        default: 'FREE'
    },
    google_access_token: {
        type: String,
        default: null
    },
    google_refresh_token: {
        type: String,
        default: null
    },
    // Email verification
    email_verified: {
        type: Boolean,
        default: false
    },
    // Usage tracking
    monthly_uploads: {
        type: Number,
        default: 0
    },
    monthly_audio_minutes: {
        type: Number,
        default: 0
    },
    monthly_contracts: {
        type: Number,
        default: 0
    },
    usage_reset_date: {
        type: Date,
        default: () => new Date()
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index for email lookup
userSchema.index({ email: 1 }, { unique: true });

// Compound index for OAuth lookup (sparse to allow null oauth_id)
userSchema.index({ auth_provider: 1, oauth_id: 1 }, {
    unique: true,
    sparse: true,
    partialFilterExpression: { oauth_id: { $exists: true, $ne: null } }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check usage limits
userSchema.methods.checkLimit = function (type) {
    const limits = {
        FREE: { uploads: 5, audio_minutes: 10, contracts: 3 },
        BASIC: { uploads: 20, audio_minutes: 120, contracts: 10 },
        PREMIUM: { uploads: 50, audio_minutes: 300, contracts: Infinity },
        ULTRA: { uploads: Infinity, audio_minutes: Infinity, contracts: Infinity }
    };

    const userLimits = limits[this.subscription_tier];

    switch (type) {
        case 'uploads':
            return this.monthly_uploads < userLimits.uploads;
        case 'audio':
            return this.monthly_audio_minutes < userLimits.audio_minutes;
        case 'contracts':
            return this.monthly_contracts < userLimits.contracts;
        default:
            return false;
    }
};

// Method to increment usage
userSchema.methods.incrementUsage = async function (type, amount = 1) {
    switch (type) {
        case 'uploads':
            this.monthly_uploads += amount;
            break;
        case 'audio':
            this.monthly_audio_minutes += amount;
            break;
        case 'contracts':
            this.monthly_contracts += amount;
            break;
    }
    await this.save();
};

// Reset monthly usage
userSchema.methods.resetMonthlyUsage = async function () {
    this.monthly_uploads = 0;
    this.monthly_audio_minutes = 0;
    this.monthly_contracts = 0;
    this.usage_reset_date = new Date();
    await this.save();
};

module.exports = mongoose.model('User', userSchema);
