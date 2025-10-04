const { getFirebaseDB } = require('../config/firebase');

/**
 * Firebase Service - Real-time data synchronization
 */

class FirebaseService {
    constructor() {
        this.db = null;
        try {
            this.db = getFirebaseDB();
        } catch (error) {
            console.log('Firebase not available');
        }
    }

    /**
     * Sync participant registration to Firebase
     */
    async syncParticipantRegistration(contestId, participant) {
        if (!this.db) return;

        try {
            const participantRef = this.db.ref(`contests/${contestId}/participants/${participant._id}`);
            await participantRef.set({
                id: participant._id.toString(),
                name: participant.name,
                email: participant.email,
                stage: participant.stage,
                platform: participant.platform,
                engagementScore: participant.engagementScore,
                registeredAt: participant.registrationDate.toISOString()
            });

            // Update live metrics
            await this.updateLiveMetrics(contestId);
        } catch (error) {
            console.error('Firebase sync error:', error.message);
        }
    }

    /**
     * Update live contest metrics
     */
    async updateLiveMetrics(contestId) {
        if (!this.db) return;

        try {
            const Contest = require('../models/Contest');
            const Participant = require('../models/Participant');

            const contest = await Contest.findById(contestId);
            const participants = await Participant.find({ contestId });

            const metrics = {
                totalParticipants: contest.currentParticipants,
                qualified: participants.filter(p => p.stage === 'Qualified').length,
                finalists: participants.filter(p => p.stage === 'Finalist').length,
                winners: participants.filter(p => p.stage === 'Winner').length,
                avgEngagement: this._calculateAverage(participants.map(p => p.engagementScore)),
                fairnessScore: contest.analytics.fairnessScore,
                lastUpdated: new Date().toISOString(),
                platformDistribution: this._getPlatformDistribution(participants)
            };

            await this.db.ref(`contests/${contestId}/metrics`).set(metrics);
        } catch (error) {
            console.error('Firebase metrics update error:', error.message);
        }
    }

    /**
     * Broadcast winner announcement
     */
    async broadcastWinners(contestId, winners) {
        if (!this.db) return;

        try {
            const winnerData = winners.map(w => ({
                id: w._id.toString(),
                name: w.name,
                email: w.email,
                platform: w.platform,
                engagementScore: w.engagementScore,
                announcedAt: new Date().toISOString()
            }));

            await this.db.ref(`contests/${contestId}/winners`).set(winnerData);

            // Trigger notification event
            await this.db.ref(`contests/${contestId}/events/winner_announced`).push({
                timestamp: new Date().toISOString(),
                winnerCount: winners.length
            });
        } catch (error) {
            console.error('Firebase winner broadcast error:', error.message);
        }
    }

    /**
     * Update engagement in real-time
     */
    async updateEngagement(contestId, participantId, engagementScore) {
        if (!this.db) return;

        try {
            await this.db.ref(`contests/${contestId}/participants/${participantId}/engagementScore`)
                .set(engagementScore);

            await this.updateLiveMetrics(contestId);
        } catch (error) {
            console.error('Firebase engagement update error:', error.message);
        }
    }

    /**
     * Stream live participant count
     */
    async incrementParticipantCount(contestId) {
        if (!this.db) return;

        try {
            const countRef = this.db.ref(`contests/${contestId}/metrics/totalParticipants`);
            await countRef.transaction((current) => {
                return (current || 0) + 1;
            });
        } catch (error) {
            console.error('Firebase count increment error:', error.message);
        }
    }

    /**
     * Log contest activity
     */
    async logActivity(contestId, activity) {
        if (!this.db) return;

        try {
            await this.db.ref(`contests/${contestId}/activity`).push({
                ...activity,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Firebase activity log error:', error.message);
        }
    }

    /**
     * Set contest status
     */
    async updateContestStatus(contestId, status) {
        if (!this.db) return;

        try {
            await this.db.ref(`contests/${contestId}/status`).set(status);
        } catch (error) {
            console.error('Firebase status update error:', error.message);
        }
    }

    // Helper methods
    _calculateAverage(values) {
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + (v || 0), 0) / values.length;
    }

    _getPlatformDistribution(participants) {
        const distribution = {};
        participants.forEach(p => {
            distribution[p.platform] = (distribution[p.platform] || 0) + 1;
        });
        return distribution;
    }
}

module.exports = new FirebaseService();
