const Participant = require('../models/Participant');
const Contest = require('../models/Contest');

/**
 * Analytics Controller - Advanced analytics and insights
 */

// Get overall platform analytics
exports.getPlatformAnalytics = async (req, res) => {
    try {
        const analytics = await Participant.aggregate([
            {
                $group: {
                    _id: '$platform',
                    totalParticipants: { $sum: 1 },
                    avgEngagement: { $avg: '$engagementScore' },
                    totalEngagement: { $sum: '$engagementScore' },
                    winners: {
                        $sum: { $cond: [{ $eq: ['$stage', 'Winner'] }, 1, 0] }
                    },
                    qualified: {
                        $sum: { $cond: [{ $eq: ['$stage', 'Qualified'] }, 1, 0] }
                    },
                    duplicates: {
                        $sum: { $cond: ['$isDuplicate', 1, 0] }
                    },
                    highFraud: {
                        $sum: { $cond: [{ $gte: ['$fraudScore', 70] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    platform: '$_id',
                    totalParticipants: 1,
                    avgEngagement: { $round: ['$avgEngagement', 2] },
                    totalEngagement: 1,
                    winners: 1,
                    qualified: 1,
                    duplicates: 1,
                    highFraud: 1,
                    conversionRate: {
                        $multiply: [
                            { $divide: ['$winners', '$totalParticipants'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { totalParticipants: -1 } }
        ]);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching platform analytics',
            error: error.message
        });
    }
};

// Get retention analytics (participants across multiple contests)
exports.getRetentionAnalytics = async (req, res) => {
    try {
        const retention = await Participant.aggregate([
            {
                $group: {
                    _id: '$email',
                    contests: { $addToSet: '$contestId' },
                    totalParticipations: { $sum: 1 },
                    wins: {
                        $sum: { $cond: [{ $eq: ['$stage', 'Winner'] }, 1, 0] }
                    },
                    avgEngagement: { $avg: '$engagementScore' }
                }
            },
            {
                $project: {
                    email: '$_id',
                    contestCount: { $size: '$contests' },
                    totalParticipations: 1,
                    wins: 1,
                    avgEngagement: { $round: ['$avgEngagement', 2] },
                    isReturning: {
                        $cond: [{ $gt: [{ $size: '$contests' }, 1] }, true, false]
                    }
                }
            },
            {
                $group: {
                    _id: '$isReturning',
                    count: { $sum: 1 },
                    avgEngagement: { $avg: '$avgEngagement' },
                    totalWins: { $sum: '$wins' }
                }
            }
        ]);

        res.json({
            success: true,
            data: retention
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching retention analytics',
            error: error.message
        });
    }
};

// Get fraud detection report
exports.getFraudReport = async (req, res) => {
    try {
        const { contestId } = req.query;

        const filter = contestId ? { contestId } : {};

        const fraudAnalytics = await Participant.aggregate([
            { $match: filter },
            {
                $facet: {
                    fraudScoreDistribution: [
                        {
                            $bucket: {
                                groupBy: '$fraudScore',
                                boundaries: [0, 20, 40, 60, 80, 100],
                                default: 'Other',
                                output: {
                                    count: { $sum: 1 },
                                    participants: {
                                        $push: {
                                            name: '$name',
                                            email: '$email',
                                            score: '$fraudScore'
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    duplicateAnalysis: [
                        {
                            $group: {
                                _id: '$isDuplicate',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    ipAnalysis: [
                        {
                            $group: {
                                _id: '$ipAddress',
                                count: { $sum: 1 },
                                participants: {
                                    $push: {
                                        name: '$name',
                                        email: '$email'
                                    }
                                }
                            }
                        },
                        { $match: { count: { $gt: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    deviceAnalysis: [
                        {
                            $group: {
                                _id: '$deviceFingerprint',
                                count: { $sum: 1 },
                                participants: {
                                    $push: {
                                        name: '$name',
                                        email: '$email'
                                    }
                                }
                            }
                        },
                        { $match: { count: { $gt: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    highRiskParticipants: [
                        { $match: { fraudScore: { $gte: 70 } } },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                fraudScore: 1,
                                isDuplicate: 1,
                                stage: 1
                            }
                        },
                        { $sort: { fraudScore: -1 } }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            data: fraudAnalytics[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating fraud report',
            error: error.message
        });
    }
};

// Get engagement funnel
exports.getEngagementFunnel = async (req, res) => {
    try {
        const { contestId } = req.query;

        const filter = contestId ? { contestId } : {};

        const funnel = await Participant.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 },
                    avgEngagement: { $avg: '$engagementScore' },
                    avgPriority: { $avg: '$priority' }
                }
            },
            {
                $project: {
                    stage: '$_id',
                    count: 1,
                    avgEngagement: { $round: ['$avgEngagement', 2] },
                    avgPriority: { $round: ['$avgPriority', 2] }
                }
            }
        ]);

        // Calculate conversion rates
        const stageOrder = ['Registered', 'Qualified', 'Finalist', 'Winner'];
        const orderedFunnel = stageOrder.map(stage => {
            const stageData = funnel.find(f => f.stage === stage);
            return stageData || { stage, count: 0, avgEngagement: 0, avgPriority: 0 };
        });

        // Add conversion rates
        for (let i = 1; i < orderedFunnel.length; i++) {
            if (orderedFunnel[i - 1].count > 0) {
                orderedFunnel[i].conversionRate =
                    (orderedFunnel[i].count / orderedFunnel[i - 1].count) * 100;
            } else {
                orderedFunnel[i].conversionRate = 0;
            }
        }

        res.json({
            success: true,
            data: orderedFunnel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating engagement funnel',
            error: error.message
        });
    }
};

// Get time-series analytics
exports.getTimeSeriesAnalytics = async (req, res) => {
    try {
        const { contestId, startDate, endDate } = req.query;

        const filter = {};
        if (contestId) filter.contestId = contestId;
        if (startDate || endDate) {
            filter.registrationDate = {};
            if (startDate) filter.registrationDate.$gte = new Date(startDate);
            if (endDate) filter.registrationDate.$lte = new Date(endDate);
        }

        const timeSeries = await Participant.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$registrationDate'
                            }
                        },
                        hour: {
                            $hour: '$registrationDate'
                        }
                    },
                    count: { $sum: 1 },
                    avgEngagement: { $avg: '$engagementScore' }
                }
            },
            { $sort: { '_id.date': 1, '_id.hour': 1 } }
        ]);

        // Group by date
        const dailyData = await Participant.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$registrationDate'
                        }
                    },
                    registrations: { $sum: 1 },
                    avgEngagement: { $avg: '$engagementScore' },
                    platforms: { $addToSet: '$platform' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                hourly: timeSeries,
                daily: dailyData
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating time-series analytics',
            error: error.message
        });
    }
};

// Get referral network analytics
exports.getReferralAnalytics = async (req, res) => {
    try {
        const { contestId } = req.query;

        const filter = contestId ? { contestId } : {};

        const referralData = await Participant.aggregate([
            { $match: filter },
            {
                $project: {
                    hasReferrals: {
                        $cond: [
                            { $gt: [{ $size: { $ifNull: ['$referrals', []] } }, 0] },
                            true,
                            false
                        ]
                    },
                    referralCount: { $size: { $ifNull: ['$referrals', []] } },
                    wasReferred: {
                        $cond: [{ $ifNull: ['$referredBy', false] }, true, false]
                    }
                }
            },
            {
                $facet: {
                    referrers: [
                        { $match: { hasReferrals: true } },
                        {
                            $group: {
                                _id: null,
                                totalReferrers: { $sum: 1 },
                                totalReferrals: { $sum: '$referralCount' },
                                avgReferralsPerReferrer: { $avg: '$referralCount' }
                            }
                        }
                    ],
                    referred: [
                        { $match: { wasReferred: true } },
                        {
                            $group: {
                                _id: null,
                                totalReferred: { $sum: 1 }
                            }
                        }
                    ],
                    topReferrers: [
                        { $match: { hasReferrals: true } },
                        { $sort: { referralCount: -1 } },
                        { $limit: 10 }
                    ]
                }
            }
        ]);

        res.json({
            success: true,
            data: referralData[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating referral analytics',
            error: error.message
        });
    }
};

// Get campaign performance
exports.getCampaignPerformance = async (req, res) => {
    try {
        const performance = await Contest.aggregate([
            {
                $match: {
                    campaignId: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$campaignId',
                    totalContests: { $sum: 1 },
                    totalParticipants: { $sum: '$currentParticipants' },
                    avgParticipants: { $avg: '$currentParticipants' },
                    totalWinners: {
                        $sum: { $size: { $ifNull: ['$winners', []] } }
                    },
                    avgFairnessScore: { $avg: '$analytics.fairnessScore' },
                    totalFraudAttempts: { $sum: '$analytics.fraudAttempts' },
                    platforms: { $addToSet: '$platforms' }
                }
            },
            {
                $project: {
                    campaignId: '$_id',
                    totalContests: 1,
                    totalParticipants: 1,
                    avgParticipants: { $round: ['$avgParticipants', 0] },
                    totalWinners: 1,
                    avgFairnessScore: { $round: ['$avgFairnessScore', 2] },
                    totalFraudAttempts: 1,
                    platforms: 1,
                    participantToWinnerRatio: {
                        $cond: [
                            { $gt: ['$totalWinners', 0] },
                            { $divide: ['$totalParticipants', '$totalWinners'] },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalParticipants: -1 } }
        ]);

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching campaign performance',
            error: error.message
        });
    }
};
