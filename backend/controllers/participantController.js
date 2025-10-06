const Participant = require('../models/Participant');
const Contest = require('../models/Contest');
const HashUtils = require('../utils/HashUtils');
const PriorityQueue = require('../utils/PriorityQueue');

/**
 * Participant Controller - Handles participant registration and management
 */

// Register new participant
exports.registerParticipant = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            contestId,
            socialMediaHandle,
            platform,
            referredBy
        } = req.body;

        // Validate required fields
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required'
            });
        }

        // Validate contest exists and is active
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        if (contest.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Contest is not active'
            });
        }

        // Check participant limit
        if (contest.currentParticipants >= contest.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Contest has reached maximum participants'
            });
        }

        // Generate unique hash for duplicate detection
        const uniqueHash = HashUtils.generateParticipantHash(
            email,
            phone || '',
            contestId
        );

        // Check for duplicates
        const existingParticipant = await Participant.findOne({ uniqueHash });
        if (existingParticipant) {
            return res.status(400).json({
                success: false,
                message: 'Participant already registered for this contest',
                duplicate: true
            });
        }

        // Generate device fingerprint
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent') || '';
        const deviceFingerprint = HashUtils.generateDeviceFingerprint(
            ipAddress,
            userAgent
        );

        // Get existing participants for fraud detection
        const existingParticipants = await Participant.find({ contestId });

        // Create participant object
        const participantData = {
            name,
            email,
            phone,
            contestId,
            socialMediaHandle,
            platform,
            uniqueHash,
            ipAddress,
            deviceFingerprint,
            referredBy,
            priority: 50, // Base priority
            stage: 'Registered'
        };

        // Calculate fraud score
        participantData.fraudScore = HashUtils.calculateFraudScore(
            participantData,
            existingParticipants
        );

        // Create participant
        const participant = new Participant(participantData);
        await participant.save();

        // Update referrer if applicable
        if (referredBy) {
            await Participant.findByIdAndUpdate(
                referredBy,
                {
                    $push: { referrals: participant._id },
                    $inc: { engagementScore: 10 }
                }
            );
        }

        // Update contest statistics
        contest.currentParticipants += 1;
        contest.analytics.totalRegistrations += 1;
        if (participantData.fraudScore > 70) {
            contest.analytics.fraudAttempts += 1;
        }
        await contest.save();

        res.status(201).json({
            success: true,
            message: 'Participant registered successfully',
            data: participant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error registering participant',
            error: error.message
        });
    }
};

// Get all participants for a contest
exports.getParticipants = async (req, res) => {
    try {
        const { contestId, stage, platform, limit = 100, page = 1 } = req.query;

        const filter = {};
        if (contestId) filter.contestId = contestId;
        if (stage) filter.stage = stage;
        if (platform) filter.platform = platform;

        const participants = await Participant.find(filter)
            .populate('referredBy', 'name email')
            .sort({ registrationDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Participant.countDocuments(filter);

        res.json({
            success: true,
            data: participants,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching participants',
            error: error.message
        });
    }
};

// Get participant by ID
exports.getParticipantById = async (req, res) => {
    try {
        const participant = await Participant.findById(req.params.id)
            .populate('referredBy', 'name email')
            .populate('referrals', 'name email');

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        res.json({
            success: true,
            data: participant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching participant',
            error: error.message
        });
    }
};

// Update participant stage (workflow)
exports.updateParticipantStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage, reason } = req.body;

        const participant = await Participant.findById(id);
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        const oldStage = participant.stage;
        participant.stage = stage;

        // Update qualification timestamp if moving to Qualified
        if (stage === 'Qualified' && oldStage !== 'Qualified') {
            participant.qualificationTimestamp = new Date();
            participant.priority += 20; // Boost priority for qualified
        }

        await participant.save();

        // Update contest analytics
        const contest = await Contest.findById(participant.contestId);
        if (contest) {
            // Decrease old stage count
            const oldStageKey = oldStage.toLowerCase();
            if (oldStageKey === 'qualified') contest.analytics.qualifiedParticipants -= 1;
            if (oldStageKey === 'finalist') contest.analytics.finalists -= 1;
            if (oldStageKey === 'disqualified') contest.analytics.disqualified -= 1;

            // Increase new stage count
            const newStageKey = stage.toLowerCase();
            if (newStageKey === 'qualified') contest.analytics.qualifiedParticipants += 1;
            if (newStageKey === 'finalist') contest.analytics.finalists += 1;
            if (newStageKey === 'disqualified') contest.analytics.disqualified += 1;

            await contest.save();
        }

        res.json({
            success: true,
            message: `Participant moved from ${oldStage} to ${stage}`,
            data: participant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating participant stage',
            error: error.message
        });
    }
};

// Bulk qualify participants using Priority Queue
exports.bulkQualifyParticipants = async (req, res) => {
    try {
        const { contestId, count } = req.body;

        // Get registered participants
        const participants = await Participant.find({
            contestId,
            stage: 'Registered',
            fraudScore: { $lt: 70 },
            isDuplicate: false
        });

        if (participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No eligible participants found'
            });
        }

        // Create priority queue
        const pq = new PriorityQueue((a, b) => {
            // Higher priority and engagement = lower comparison value (min-heap inverted)
            return (b.priority + b.engagementScore) - (a.priority + a.engagementScore);
        });

        // Add all participants to priority queue
        participants.forEach(p => pq.enqueue(p));

        // Qualify top participants
        const qualifyCount = Math.min(count || participants.length, participants.length);
        const qualified = [];

        for (let i = 0; i < qualifyCount; i++) {
            const participant = pq.dequeue();
            if (participant) {
                qualified.push(participant._id);
            }
        }

        // Update participants to Qualified stage
        await Participant.updateMany(
            { _id: { $in: qualified } },
            {
                $set: {
                    stage: 'Qualified',
                    qualificationTimestamp: new Date()
                },
                $inc: { priority: 20 }
            }
        );

        // Update contest analytics
        await Contest.findByIdAndUpdate(contestId, {
            $inc: { 'analytics.qualifiedParticipants': qualified.length }
        });

        res.json({
            success: true,
            message: `${qualified.length} participants qualified`,
            data: { qualifiedCount: qualified.length }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error qualifying participants',
            error: error.message
        });
    }
};

// Update engagement score
exports.updateEngagement = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, value } = req.body;

        const participant = await Participant.findById(id);
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        // Update engagement based on action
        const engagementIncrease = value || 0;
        participant.engagementScore += engagementIncrease;
        participant.priority += Math.floor(engagementIncrease / 2);

        await participant.save();

        res.json({
            success: true,
            message: 'Engagement updated',
            data: {
                engagementScore: participant.engagementScore,
                priority: participant.priority
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating engagement',
            error: error.message
        });
    }
};

// Check for duplicates
exports.checkDuplicate = async (req, res) => {
    try {
        const { email, phone, contestId } = req.body;

        const uniqueHash = HashUtils.generateParticipantHash(
            email,
            phone || '',
            contestId
        );

        const existing = await Participant.findOne({ uniqueHash });

        res.json({
            success: true,
            isDuplicate: existing !== null,
            data: existing ? {
                id: existing._id,
                name: existing.name,
                registrationDate: existing.registrationDate
            } : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking duplicate',
            error: error.message
        });
    }
};
