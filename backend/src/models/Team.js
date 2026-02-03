const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    invite_code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    projects: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index for invite code lookups
teamSchema.index({ invite_code: 1 }, { unique: true });
// Index for finding teams by member
teamSchema.index({ members: 1 });

module.exports = mongoose.model('Team', teamSchema);
