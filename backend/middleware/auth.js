const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

// Generate JWT Token
exports.generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'your_secret_key_change_in_production',
        { expiresIn: '7d' } // Token valid for 7 days
    );
};

// Verify JWT Token
exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_change_in_production');
    } catch (error) {
        return null;
    }
};

// Middleware to protect routes (requires authentication)
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        // Verify token
        const decoded = exports.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
        }

        // Get user from token
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated.'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Not authorized to access this route.'
        });
    }
};

// Middleware to check if user is the owner of a contest
exports.isContestOwner = async (req, res, next) => {
    try {
        const Contest = require('../models/Contest');
        const contestId = req.params.id;

        if (!contestId) {
            return res.status(400).json({
                success: false,
                message: 'Contest ID is required'
            });
        }

        const contest = await Contest.findById(contestId);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check if the logged-in user is the owner of the contest
        if (contest.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this contest. Only the contest owner can perform this action.'
            });
        }

        // Attach contest to request for use in controller
        req.contest = contest;
        next();

    } catch (error) {
        console.error('Contest ownership check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking contest ownership'
        });
    }
};

// Optional authentication (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            const decoded = exports.verifyToken(token);
            if (decoded) {
                const user = await User.findById(decoded.id);
                if (user && user.isActive) {
                    req.user = user;
                }
            }
        }

        next();
    } catch (error) {
        next();
    }
};
