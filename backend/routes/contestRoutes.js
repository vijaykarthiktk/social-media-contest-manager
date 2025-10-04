const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');

// Contest CRUD routes
router.post('/', contestController.createContest);
router.get('/', contestController.getAllContests);
router.get('/:id', contestController.getContestById);
router.put('/:id', contestController.updateContest);
router.delete('/:id', contestController.deleteContest);

// Winner selection
router.post('/:id/select-winners', contestController.selectWinners);

// Analytics
router.get('/:id/analytics', contestController.getContestAnalytics);

module.exports = router;
