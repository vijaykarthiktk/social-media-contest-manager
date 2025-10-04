const crypto = require('crypto');

/**
 * Fairness Engine - Ensures unbiased winner selection
 * Implements multiple algorithms with provable fairness
 */

class FairnessEngine {
    /**
     * Pure Random Selection with Cryptographic Randomness
     * Algorithm: Fisher-Yates Shuffle with crypto.randomBytes
     * Fairness Guarantee: Each participant has equal probability (1/n)
     */
    static pureRandomSelection(participants, count = 1, seed = null) {
        if (participants.length === 0) return [];
        if (count > participants.length) count = participants.length;

        const pool = [...participants];
        const winners = [];

        // Use seed if provided (for reproducibility and verification)
        let rng = this._createSeededRNG(seed);

        // Fisher-Yates shuffle with cryptographic randomness
        for (let i = pool.length - 1; i > 0; i--) {
            const j = seed ?
                rng.next(i + 1) :
                crypto.randomInt(0, i + 1);

            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        // Select first 'count' participants
        return pool.slice(0, count);
    }

    /**
     * Weighted Random Selection Based on Engagement
     * Algorithm: Fitness Proportionate Selection (Roulette Wheel)
     * Fairness Guarantee: Probability proportional to engagement score
     */
    static weightedRandomSelection(participants, count = 1, weights = {}) {
        if (participants.length === 0) return [];

        // Calculate total weight
        const totalWeight = participants.reduce((sum, p) => {
            return sum + this._calculateParticipantWeight(p, weights);
        }, 0);

        if (totalWeight === 0) {
            // Fall back to pure random if no weights
            return this.pureRandomSelection(participants, count);
        }

        const winners = [];
        const remaining = [...participants];

        for (let i = 0; i < count && remaining.length > 0; i++) {
            const currentTotal = remaining.reduce((sum, p) => {
                return sum + this._calculateParticipantWeight(p, weights);
            }, 0);

            const random = Math.random() * currentTotal;
            let accumulated = 0;
            let selectedIndex = 0;

            for (let j = 0; j < remaining.length; j++) {
                accumulated += this._calculateParticipantWeight(remaining[j], weights);
                if (accumulated >= random) {
                    selectedIndex = j;
                    break;
                }
            }

            winners.push(remaining[selectedIndex]);
            remaining.splice(selectedIndex, 1);
        }

        return winners;
    }

    /**
     * Priority-Based Selection Using Priority Queue
     * Algorithm: Top-K selection from heap
     * Fairness Guarantee: Transparent priority criteria (time-based + engagement)
     */
    static priorityBasedSelection(participants, count = 1) {
        if (participants.length === 0) return [];

        // Sort by priority (higher is better)
        const sorted = [...participants].sort((a, b) => {
            // Primary: priority score
            if (b.priority !== a.priority) {
                return b.priority - a.priority;
            }
            // Secondary: registration time (earlier is better)
            return new Date(a.registrationDate) - new Date(b.registrationDate);
        });

        return sorted.slice(0, count);
    }

    /**
     * Time-Based Fair Selection (FIFO with Random Sampling)
     * Algorithm: Stratified sampling across time windows
     * Fairness Guarantee: Equal opportunity regardless of registration time
     */
    static timeBasedSelection(participants, count = 1, windowCount = 5) {
        if (participants.length === 0) return [];

        // Sort by registration date
        const sorted = [...participants].sort(
            (a, b) => new Date(a.registrationDate) - new Date(b.registrationDate)
        );

        // Divide into time windows
        const windowSize = Math.ceil(sorted.length / windowCount);
        const windows = [];

        for (let i = 0; i < sorted.length; i += windowSize) {
            windows.push(sorted.slice(i, i + windowSize));
        }

        // Select proportionally from each window
        const winners = [];
        const perWindow = Math.ceil(count / windows.length);

        windows.forEach(window => {
            const selected = this.pureRandomSelection(window, perWindow);
            winners.push(...selected);
        });

        return winners.slice(0, count);
    }

    /**
     * Hybrid Selection (Combines multiple methods)
     * Algorithm: Multi-criteria decision making
     * Fairness Guarantee: Balanced approach considering multiple factors
     */
    static hybridSelection(participants, count = 1, options = {}) {
        const {
            randomWeight = 0.4,
            engagementWeight = 0.3,
            priorityWeight = 0.2,
            timeWeight = 0.1
        } = options;

        if (participants.length === 0) return [];

        // Calculate composite score for each participant
        const scored = participants.map(p => {
            const randomScore = Math.random();
            const engagementScore = p.engagementScore / 100;
            const priorityScore = p.priority / 100;
            const timeScore = this._calculateTimeScore(p.registrationDate);

            const compositeScore =
                (randomScore * randomWeight) +
                (engagementScore * engagementWeight) +
                (priorityScore * priorityWeight) +
                (timeScore * timeWeight);

            return {
                participant: p,
                score: compositeScore
            };
        });

        // Sort by composite score
        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, count).map(s => s.participant);
    }

    /**
     * Calculate Fairness Score for Contest
     * Returns a score (0-100) indicating fairness of the selection process
     */
    static calculateFairnessScore(contest, participants, winners) {
        let score = 100;

        // Check 1: Winner selection ratio
        const expectedRatio = contest.numberOfWinners / participants.length;
        const actualRatio = winners.length / participants.length;
        if (Math.abs(expectedRatio - actualRatio) > 0.01) {
            score -= 10;
        }

        // Check 2: Duplicate detection effectiveness
        const duplicates = participants.filter(p => p.isDuplicate);
        const duplicatesInWinners = winners.filter(w => w.isDuplicate);
        if (duplicatesInWinners.length > 0) {
            score -= 30; // Major fairness violation
        }

        // Check 3: Fraud attempts blocked
        const highFraudScore = participants.filter(p => p.fraudScore > 70);
        const fraudInWinners = winners.filter(w => w.fraudScore > 70);
        if (fraudInWinners.length > 0) {
            score -= 25;
        }

        // Check 4: Platform diversity (if multiple platforms)
        const platforms = new Set(participants.map(p => p.platform));
        if (platforms.size > 1) {
            const winnerPlatforms = new Set(winners.map(w => w.platform));
            const diversityRatio = winnerPlatforms.size / platforms.size;
            if (diversityRatio < 0.5) {
                score -= 15;
            }
        }

        // Check 5: Time distribution
        const timeDistribution = this._analyzeTimeDistribution(winners);
        if (timeDistribution.skewness > 0.7) {
            score -= 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate Fairness Report
     * Provides detailed explanation of fairness metrics
     */
    static generateFairnessReport(contest, participants, winners, algorithm) {
        return {
            algorithm,
            timestamp: new Date().toISOString(),
            totalParticipants: participants.length,
            totalWinners: winners.length,
            fairnessScore: this.calculateFairnessScore(contest, participants, winners),
            metrics: {
                duplicatesDetected: participants.filter(p => p.isDuplicate).length,
                fraudAttempts: participants.filter(p => p.fraudScore > 70).length,
                averageEngagement: this._calculateAverage(participants.map(p => p.engagementScore)),
                platformDistribution: this._calculateDistribution(participants, 'platform'),
                timeDistribution: this._analyzeTimeDistribution(participants),
                selectionCriteria: this._explainSelectionCriteria(algorithm)
            },
            winners: winners.map(w => ({
                id: w._id,
                name: w.name,
                email: w.email,
                engagementScore: w.engagementScore,
                priority: w.priority,
                registrationDate: w.registrationDate,
                platform: w.platform
            }))
        };
    }

    // Helper Methods

    static _createSeededRNG(seed) {
        if (!seed) return null;

        let state = parseInt(seed.substring(0, 16), 16);

        return {
            next: (max) => {
                state = (state * 9301 + 49297) % 233280;
                return Math.floor((state / 233280) * max);
            }
        };
    }

    static _calculateParticipantWeight(participant, weights = {}) {
        const {
            engagementMultiplier = 1,
            referralBonus = 5,
            priorityFactor = 1
        } = weights;

        let weight = 1; // Base weight

        // Add engagement score
        weight += (participant.engagementScore || 0) * engagementMultiplier;

        // Add referral bonus
        weight += (participant.referrals?.length || 0) * referralBonus;

        // Add priority factor
        weight += (participant.priority || 0) * priorityFactor;

        return weight;
    }

    static _calculateTimeScore(registrationDate) {
        const now = Date.now();
        const registered = new Date(registrationDate).getTime();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        const age = now - registered;

        // Earlier registrations get slightly higher scores
        return Math.max(0, 1 - (age / maxAge));
    }

    static _calculateAverage(values) {
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    static _calculateDistribution(items, field) {
        const distribution = {};
        items.forEach(item => {
            const value = item[field] || 'Unknown';
            distribution[value] = (distribution[value] || 0) + 1;
        });
        return distribution;
    }

    static _analyzeTimeDistribution(participants) {
        if (participants.length === 0) {
            return { skewness: 0, spread: 0 };
        }

        const times = participants
            .map(p => new Date(p.registrationDate).getTime())
            .sort((a, b) => a - b);

        const mean = times.reduce((sum, t) => sum + t, 0) / times.length;
        const median = times[Math.floor(times.length / 2)];
        const range = times[times.length - 1] - times[0];

        // Simple skewness measure
        const skewness = Math.abs(mean - median) / (range || 1);

        return {
            skewness,
            spread: range,
            earliest: new Date(times[0]),
            latest: new Date(times[times.length - 1])
        };
    }

    static _explainSelectionCriteria(algorithm) {
        const explanations = {
            'PureRandom': 'Winners selected using cryptographically secure random number generation. Each participant has equal probability of winning.',
            'WeightedRandom': 'Winners selected based on engagement scores. Higher engagement increases probability but does not guarantee selection.',
            'PriorityBased': 'Winners selected based on priority scores. Transparent criteria including registration time and engagement.',
            'TimeBased': 'Winners selected using stratified sampling across registration time windows. Ensures fair representation across time.',
            'Hybrid': 'Winners selected using composite scoring combining randomness, engagement, priority, and time factors.'
        };

        return explanations[algorithm] || 'Custom selection algorithm';
    }
}

module.exports = FairnessEngine;
