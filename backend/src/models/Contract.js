const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meeting_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeetingTranscript',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    contract_type: {
        type: String,
        enum: ['NDA', 'SERVICE_AGREEMENT', 'EMPLOYMENT', 'PARTNERSHIP', 'GENERAL', 'CUSTOM'],
        default: 'GENERAL'
    },
    parties: [{
        name: String,
        role: String, // e.g., "Party A", "Service Provider", "Client"
        email: String,
        organization: String
    }],
    draft_text: {
        type: String,
        default: ''
    },
    final_text: {
        type: String,
        default: ''
    },
    clauses: [{
        title: String,
        content: String,
        order: Number
    }],
    terms: {
        effective_date: Date,
        expiration_date: Date,
        payment_terms: String,
        deliverables: [String]
    },
    status: {
        type: String,
        enum: ['DRAFTED', 'REVIEW', 'EDITED', 'APPROVED', 'FINALIZED', 'SIGNED'],
        default: 'DRAFTED'
    },
    revision_history: [{
        version: Number,
        content: String,
        changed_by: String,
        changed_at: Date,
        notes: String
    }],
    // Signature tracking (future feature)
    signatures: [{
        party_name: String,
        signed_at: Date,
        ip_address: String
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index for user queries
contractSchema.index({ user_id: 1, created_at: -1 });
contractSchema.index({ user_id: 1, status: 1 });
contractSchema.index({ meeting_id: 1 });

module.exports = mongoose.model('Contract', contractSchema);
