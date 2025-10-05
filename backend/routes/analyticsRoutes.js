const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Analytics routes (admin and moderator only)
router.get('/platform', protect, authorize('admin', 'moderator'), analyticsController.getPlatformAnalytics);
router.get('/retention', protect, authorize('admin', 'moderator'), analyticsController.getRetentionAnalytics);
router.get('/fraud', protect, authorize('admin', 'moderator'), analyticsController.getFraudReport);
router.get('/funnel', protect, authorize('admin', 'moderator'), analyticsController.getEngagementFunnel);
router.get('/timeseries', protect, authorize('admin', 'moderator'), analyticsController.getTimeSeriesAnalytics);
router.get('/referrals', protect, authorize('admin', 'moderator'), analyticsController.getReferralAnalytics);
router.get('/campaigns', protect, authorize('admin', 'moderator'), analyticsController.getCampaignPerformance);

module.exports = router;
