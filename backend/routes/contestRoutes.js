const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { protect, isContestOwner, optionalAuth } = require('../middleware/auth');

// Contest CRUD routes
router.post('/', protect, contestController.createContest);
router.get('/', optionalAuth, contestController.getAllContests);
router.get('/:id', optionalAuth, contestController.getContestById);
router.put('/:id', protect, isContestOwner, contestController.updateContest);
router.delete('/:id', protect, isContestOwner, contestController.deleteContest);

// Winner selection (contest owner only)
router.post('/:id/select-winners', protect, isContestOwner, contestController.selectWinners);

// Analytics (contest owner only)
router.get('/:id/analytics', protect, isContestOwner, contestController.getContestAnalytics);

module.exports = router;
