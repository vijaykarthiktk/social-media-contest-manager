const Contest = require('../models/Contest');
const Participant = require('../models/Participant');
const FairnessEngine = require('../utils/FairnessEngine');
const { getFirebaseDB } = require('../config/firebase');

/**
 * Contest Controller - Handles contest operations
 */

// Create new contest
exports.createContest = async (req, res) => {
    try {
        const contestData = req.body;

        // Generate random seed for fairness
        if (!contestData.randomSeed) {
            const crypto = require('crypto');
            contestData.randomSeed = crypto.randomBytes(16).toString('hex');
        }

        const contest = new Contest(contestData);
        await contest.save();

        // Sync to Firebase for real-time updates
        try {
            const db = getFirebaseDB();
            await db.ref(`contests/${contest._id}`).set({
                title: contest.title,
                status: contest.status,
                currentParticipants: 0,
                analytics: contest.analytics
            });
        } catch (firebaseError) {
            console.log('Firebase sync skipped:', firebaseError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Contest created successfully',
            data: contest
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating contest',
            error: error.message
        });
    }
};

// Get all contests
exports.getAllContests = async (req, res) => {
    try {
        const { status, campaignId, limit = 50, page = 1 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (campaignId) filter.campaignId = campaignId;

        const contests = await Contest.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Contest.countDocuments(filter);

        res.json({
            success: true,
            data: contests,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contests',
            error: error.message
        });
    }
};

// Get contest by ID
exports.getContestById = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        res.json({
            success: true,
            data: contest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contest',
            error: error.message
        });
    }
};

// Update contest
exports.updateContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Sync to Firebase
        try {
            const db = getFirebaseDB();
            await db.ref(`contests/${contest._id}`).update({
                status: contest.status,
                currentParticipants: contest.currentParticipants,
                analytics: contest.analytics
            });
        } catch (firebaseError) {
            console.log('Firebase sync skipped:', firebaseError.message);
        }

        res.json({
            success: true,
            message: 'Contest updated successfully',
            data: contest
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating contest',
            error: error.message
        });
    }
};

// Delete contest
exports.deleteContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndDelete(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Delete associated participants
        await Participant.deleteMany({ contestId: contest._id });

        // Remove from Firebase
        try {
            const db = getFirebaseDB();
            await db.ref(`contests/${contest._id}`).remove();
        } catch (firebaseError) {
            console.log('Firebase sync skipped:', firebaseError.message);
        }

        res.json({
            success: true,
            message: 'Contest deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting contest',
            error: error.message
        });
    }
};

// Select winners using fairness algorithm
exports.selectWinners = async (req, res) => {
    try {
        const contestId = req.params.id;
        const { algorithm, count } = req.body;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Get qualified participants only
        const participants = await Participant.find({
            contestId,
            stage: { $in: ['Qualified', 'Finalist'] },
            isDuplicate: false,
            fraudScore: { $lt: 70 }
        });

        if (participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No qualified participants found'
            });
        }

        const numberOfWinners = count || contest.numberOfWinners;
        let winners = [];

        // Select winners based on algorithm
        switch (algorithm || contest.fairnessAlgorithm) {
            case 'PureRandom':
                winners = FairnessEngine.pureRandomSelection(
                    participants,
                    numberOfWinners,
                    contest.randomSeed
                );
                break;

            case 'WeightedRandom':
                winners = FairnessEngine.weightedRandomSelection(
                    participants,
                    numberOfWinners,
                    contest.engagementWeights
                );
                break;

            case 'PriorityBased':
                winners = FairnessEngine.priorityBasedSelection(
                    participants,
                    numberOfWinners
                );
                break;

            case 'TimeBased':
                winners = FairnessEngine.timeBasedSelection(
                    participants,
                    numberOfWinners
                );
                break;

            default:
                winners = FairnessEngine.hybridSelection(
                    participants,
                    numberOfWinners
                );
        }

        // Update winner status
        const winnerIds = winners.map(w => w._id);
        await Participant.updateMany(
            { _id: { $in: winnerIds } },
            { $set: { stage: 'Winner' } }
        );

        // Update contest with winners
        contest.winners = winners.map(w => ({
            participantId: w._id,
            selectedAt: new Date()
        }));
        contest.status = 'Completed';
        contest.analytics.fairnessScore = FairnessEngine.calculateFairnessScore(
            contest,
            participants,
            winners
        );
        await contest.save();

        // Generate fairness report
        const fairnessReport = FairnessEngine.generateFairnessReport(
            contest,
            participants,
            winners,
            algorithm || contest.fairnessAlgorithm
        );

        // Sync to Firebase
        try {
            const db = getFirebaseDB();
            await db.ref(`contests/${contest._id}/winners`).set(
                winners.map(w => ({
                    id: w._id.toString(),
                    name: w.name,
                    email: w.email,
                    selectedAt: new Date().toISOString()
                }))
            );
        } catch (firebaseError) {
            console.log('Firebase sync skipped:', firebaseError.message);
        }

        res.json({
            success: true,
            message: 'Winners selected successfully',
            data: {
                winners,
                fairnessReport
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error selecting winners',
            error: error.message
        });
    }
};

// Get contest analytics
exports.getContestAnalytics = async (req, res) => {
    try {
        const contestId = req.params.id;

        // Aggregation pipeline for detailed analytics
        const analytics = await Participant.aggregate([
            { $match: { contestId: require('mongoose').Types.ObjectId(contestId) } },
            {
                $facet: {
                    stageDistribution: [
                        {
                            $group: {
                                _id: '$stage',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    platformDistribution: [
                        {
                            $group: {
                                _id: '$platform',
                                count: { $sum: 1 },
                                avgEngagement: { $avg: '$engagementScore' }
                            }
                        }
                    ],
                    engagementStats: [
                        {
                            $group: {
                                _id: null,
                                totalEngagement: { $sum: '$engagementScore' },
                                avgEngagement: { $avg: '$engagementScore' },
                                maxEngagement: { $max: '$engagementScore' },
                                minEngagement: { $min: '$engagementScore' }
                            }
                        }
                    ],
                    fraudStats: [
                        {
                            $group: {
                                _id: null,
                                duplicates: {
                                    $sum: { $cond: ['$isDuplicate', 1, 0] }
                                },
                                highFraud: {
                                    $sum: { $cond: [{ $gte: ['$fraudScore', 70] }, 1, 0] }
                                },
                                avgFraudScore: { $avg: '$fraudScore' }
                            }
                        }
                    ],
                    referralStats: [
                        {
                            $group: {
                                _id: null,
                                totalReferrals: { $sum: { $size: '$referrals' } },
                                avgReferrals: { $avg: { $size: '$referrals' } }
                            }
                        }
                    ],
                    timeDistribution: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: '%Y-%m-%d',
                                        date: '$registrationDate'
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ]);

        const contest = await Contest.findById(contestId);

        res.json({
            success: true,
            data: {
                contest: contest.analytics,
                detailed: analytics[0]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};
