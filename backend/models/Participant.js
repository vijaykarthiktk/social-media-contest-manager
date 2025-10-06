const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },

    // Contest Reference
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
        index: true
    },

    // Social Media Information
    socialMediaHandle: {
        type: String,
        trim: true
    },
    platform: {
        type: String,
        enum: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Other'],
        default: 'Other'
    },

    // Participant Status
    stage: {
        type: String,
        enum: ['Registered', 'Qualified', 'Finalist', 'Winner', 'Disqualified'],
        default: 'Registered',
        index: true
    },

    // Fairness & Fraud Prevention
    uniqueHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ipAddress: {
        type: String
    },
    deviceFingerprint: {
        type: String
    },
    isDuplicate: {
        type: Boolean,
        default: false
    },
    fraudScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Engagement Metrics
    engagementScore: {
        type: Number,
        default: 0,
        min: 0
    },
    referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
    }],
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
    },

    // Priority Queue Data
    priority: {
        type: Number,
        default: 0
    },
    qualificationTimestamp: {
        type: Date
    },

    // Additional Data
    metadata: {
        type: Map,
        of: String
    },

    // Timestamps
    registrationDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
participantSchema.index({ contestId: 1, email: 1 }, { unique: true });
participantSchema.index({ contestId: 1, stage: 1 });
participantSchema.index({ contestId: 1, priority: -1 });

// Update lastUpdated on save
participantSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Participant', participantSchema);
