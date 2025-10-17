const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Get current month analytics
router.get('/current', AnalyticsController.getCurrentMonthAnalytics);

// Get last N months analytics
router.get('/recent', AnalyticsController.getLastNMonthsAnalytics);

// Get analytics for a date range
router.get('/range', AnalyticsController.getAnalyticsRange);

// Get yearly analytics
router.get('/year/:year', AnalyticsController.getYearlyAnalytics);

// Get monthly analytics for a specific month
router.get('/month/:year/:month', AnalyticsController.getMonthlyAnalytics);

// Recalculate monthly analytics for a specific month
router.post('/recalculate/:year/:month', AnalyticsController.recalculateMonthlyAnalytics);

// Recalculate all monthly analytics
router.post('/recalculate-all', AnalyticsController.recalculateAllAnalytics);

module.exports = router;

