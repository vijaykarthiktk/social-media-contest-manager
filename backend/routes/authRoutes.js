const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    logout,
    updatePassword,
    createAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin); // Should be disabled in production

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
