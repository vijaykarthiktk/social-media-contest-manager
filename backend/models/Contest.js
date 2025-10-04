const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },

    // Contest Configuration
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'],
        default: 'Draft',
        index: true
    },

    // Dates
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },

    // Participant Limits
    maxParticipants: {
        type: Number,
        default: 10000
    },
    currentParticipants: {
        type: Number,
        default: 0
    },

    // Winner Configuration
    numberOfWinners: {
        type: Number,
        default: 1,
        min: 1
    },
    winnerSelectionMethod: {
        type: String,
        enum: ['Random', 'HighestEngagement', 'PriorityQueue', 'Hybrid'],
        default: 'Random'
    },

    // Fairness Settings
    fairnessAlgorithm: {
        type: String,
        enum: ['PureRandom', 'WeightedRandom', 'PriorityBased', 'TimeBased'],
        default: 'PureRandom'
    },
    randomSeed: {
        type: String
    },
    duplicateCheckEnabled: {
        type: Boolean,
        default: true
    },
    fraudDetectionEnabled: {
        type: Boolean,
        default: true
    },

    // Engagement Rules
    engagementWeights: {
        referrals: {
            type: Number,
            default: 10
        },
        socialShares: {
            type: Number,
            default: 5
        },
        comments: {
            type: Number,
            default: 3
        },
        likes: {
            type: Number,
            default: 1
        }
    },

    // Platform & Campaign
    platforms: [{
        type: String,
        enum: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Other']
    }],
    campaignId: {
        type: String,
        index: true
    },

    // Winners
    winners: [{
        participantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Participant'
        },
        selectedAt: {
            type: Date,
            default: Date.now
        },
        prize: {
            type: String
        }
    }],

    // Analytics
    analytics: {
        totalRegistrations: {
            type: Number,
            default: 0
        },
        qualifiedParticipants: {
            type: Number,
            default: 0
        },
        finalists: {
            type: Number,
            default: 0
        },
        disqualified: {
            type: Number,
            default: 0
        },
        duplicatesDetected: {
            type: Number,
            default: 0
        },
        fraudAttempts: {
            type: Number,
            default: 0
        },
        fairnessScore: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        }
    },

    // Metadata
    createdBy: {
        type: String
    },
    tags: [String]
}, {
    timestamps: true
});

// Indexes
contestSchema.index({ status: 1, startDate: 1 });
contestSchema.index({ campaignId: 1 });

// Validate dates
contestSchema.pre('save', function (next) {
    if (this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});

module.exports = mongoose.model('Contest', contestSchema);
