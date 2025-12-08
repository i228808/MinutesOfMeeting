const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    tier: {
        type: String,
        enum: ['FREE', 'BASIC', 'ULTRA'],
        default: 'FREE'
    },
    limits: {
        upload_limit: {
            type: Number,
            default: 5
        },
        audio_limit: {
            type: Number,
            default: 10 // minutes
        },
        contract_limit: {
            type: Number,
            default: 3
        }
    },
    renewal_date: {
        type: Date,
        default: null
    },
    stripe_customer_id: {
        type: String,
        default: null
    },
    stripe_subscription_id: {
        type: String,
        default: null
    },
    stripe_price_id: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING', 'INACTIVE'],
        default: 'ACTIVE'
    },
    cancel_at_period_end: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Set limits based on tier
subscriptionSchema.pre('save', function (next) {
    const tierLimits = {
        FREE: { upload_limit: 5, audio_limit: 10, contract_limit: 3 },
        BASIC: { upload_limit: 50, audio_limit: 120, contract_limit: 20 },
        ULTRA: { upload_limit: 999999, audio_limit: 999999, contract_limit: 999999 }
    };

    if (this.isModified('tier')) {
        this.limits = tierLimits[this.tier];
    }
    next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
