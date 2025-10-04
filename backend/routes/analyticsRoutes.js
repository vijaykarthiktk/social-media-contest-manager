const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Analytics routes
router.get('/platform', analyticsController.getPlatformAnalytics);
router.get('/retention', analyticsController.getRetentionAnalytics);
router.get('/fraud', analyticsController.getFraudReport);
router.get('/funnel', analyticsController.getEngagementFunnel);
router.get('/timeseries', analyticsController.getTimeSeriesAnalytics);
router.get('/referrals', analyticsController.getReferralAnalytics);
router.get('/campaigns', analyticsController.getCampaignPerformance);

module.exports = router;
