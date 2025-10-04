const crypto = require('crypto');

/**
 * Hash Utilities for Duplicate Detection and Data Integrity
 * Uses SHA-256 for cryptographic hashing
 */

class HashUtils {
    /**
     * Generate unique hash for participant identification
     * Combines email, phone, and contest ID for uniqueness
     */
    static generateParticipantHash(email, phone, contestId, additionalData = {}) {
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone ? phone.replace(/\D/g, '') : '';

        const dataString = JSON.stringify({
            email: normalizedEmail,
            phone: normalizedPhone,
            contestId: contestId.toString(),
            ...additionalData
        });

        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Generate hash for device fingerprinting
     * Helps detect multiple submissions from same device
     */
    static generateDeviceFingerprint(ipAddress, userAgent, additionalInfo = {}) {
        const dataString = JSON.stringify({
            ip: ipAddress,
            ua: userAgent,
            ...additionalInfo
        });

        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Generate deterministic seed for random number generation
     * Ensures fairness by creating verifiable randomness
     */
    static generateRandomSeed(contestId, timestamp) {
        const dataString = `${contestId}-${timestamp}`;
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Create hash map for O(1) duplicate lookup
     * Returns a Map data structure for efficient duplicate checking
     */
    static createHashMap(participants) {
        const hashMap = new Map();

        participants.forEach(participant => {
            if (participant.uniqueHash) {
                hashMap.set(participant.uniqueHash, participant);
            }
        });

        return hashMap;
    }

    /**
     * Check if hash exists in database (duplicate detection)
     */
    static async isDuplicateHash(hash, ParticipantModel) {
        const existing = await ParticipantModel.findOne({ uniqueHash: hash });
        return existing !== null;
    }

    /**
     * Detect potential fraud based on multiple factors
     * Returns fraud score (0-100, higher = more suspicious)
     */
    static calculateFraudScore(participant, existingParticipants) {
        let score = 0;

        // Check for duplicate email
        const duplicateEmail = existingParticipants.filter(
            p => p.email === participant.email && p._id !== participant._id
        );
        if (duplicateEmail.length > 0) score += 40;

        // Check for duplicate device fingerprint
        if (participant.deviceFingerprint) {
            const duplicateDevice = existingParticipants.filter(
                p => p.deviceFingerprint === participant.deviceFingerprint &&
                    p._id !== participant._id
            );
            if (duplicateDevice.length > 2) score += 30;
        }

        // Check for duplicate IP address
        if (participant.ipAddress) {
            const duplicateIP = existingParticipants.filter(
                p => p.ipAddress === participant.ipAddress &&
                    p._id !== participant._id
            );
            if (duplicateIP.length > 5) score += 20;
        }

        // Check for suspicious registration patterns
        const recentRegistrations = existingParticipants.filter(
            p => {
                const timeDiff = Math.abs(
                    new Date(p.registrationDate) - new Date(participant.registrationDate)
                );
                return timeDiff < 60000; // Within 1 minute
            }
        );
        if (recentRegistrations.length > 10) score += 10;

        return Math.min(score, 100);
    }

    /**
     * Generate verification token
     */
    static generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Compare two hashes securely (timing-safe)
     */
    static compareHashes(hash1, hash2) {
        if (hash1.length !== hash2.length) return false;
        return crypto.timingSafeEqual(
            Buffer.from(hash1),
            Buffer.from(hash2)
        );
    }
}

module.exports = HashUtils;
