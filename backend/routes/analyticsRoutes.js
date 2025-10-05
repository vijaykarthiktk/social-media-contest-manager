const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Analytics routes (authenticated users)
router.get('/platform', protect, analyticsController.getPlatformAnalytics);
router.get('/retention', protect, analyticsController.getRetentionAnalytics);
router.get('/fraud', protect, analyticsController.getFraudReport);
router.get('/funnel', protect, analyticsController.getEngagementFunnel);
router.get('/timeseries', protect, analyticsController.getTimeSeriesAnalytics);
router.get('/referrals', protect, analyticsController.getReferralAnalytics);
router.get('/campaigns', protect, analyticsController.getCampaignPerformance);

module.exports = router;
