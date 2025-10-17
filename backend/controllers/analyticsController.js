const AnalyticsService = require('../services/analyticsService');

class AnalyticsController {
  /**
   * Get monthly analytics for a specific month
   */
  static async getMonthlyAnalytics(req, res) {
    try {
      const { year, month } = req.params;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: 'Year and month are required'
        });
      }

      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          message: 'Month must be between 1 and 12'
        });
      }

      const analytics = await AnalyticsService.getMonthlyAnalytics(yearNum, monthNum);

      res.json({
        success: true,
        message: 'Monthly analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current month analytics
   */
  static async getCurrentMonthAnalytics(req, res) {
    try {
      const analytics = await AnalyticsService.calculateCurrentMonthAnalytics();

      res.json({
        success: true,
        message: 'Current month analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get analytics for last N months
   */
  static async getLastNMonthsAnalytics(req, res) {
    try {
      const months = parseInt(req.query.months) || 6;

      if (months < 1 || months > 24) {
        return res.status(400).json({
          success: false,
          message: 'Months must be between 1 and 24'
        });
      }

      const analytics = await AnalyticsService.getLastNMonthsAnalytics(months);

      res.json({
        success: true,
        message: `Last ${months} months analytics retrieved successfully`,
        data: analytics,
        count: analytics.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get yearly analytics
   */
  static async getYearlyAnalytics(req, res) {
    try {
      const { year } = req.params;

      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Year is required'
        });
      }

      const yearNum = parseInt(year);
      const analytics = await AnalyticsService.getYearlyAnalytics(yearNum);

      res.json({
        success: true,
        message: 'Yearly analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get analytics for a date range
   */
  static async getAnalyticsRange(req, res) {
    try {
      const { startYear, startMonth, endYear, endMonth } = req.query;

      if (!startYear || !startMonth || !endYear || !endMonth) {
        return res.status(400).json({
          success: false,
          message: 'startYear, startMonth, endYear, and endMonth are required'
        });
      }

      const analytics = await AnalyticsService.getAnalyticsRange(
        parseInt(startYear),
        parseInt(startMonth),
        parseInt(endYear),
        parseInt(endMonth)
      );

      res.json({
        success: true,
        message: 'Analytics range retrieved successfully',
        data: analytics,
        count: analytics.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Recalculate monthly analytics for a specific month
   */
  static async recalculateMonthlyAnalytics(req, res) {
    try {
      const { year, month } = req.params;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: 'Year and month are required'
        });
      }

      const analytics = await AnalyticsService.calculateMonthlyAnalytics(
        parseInt(year),
        parseInt(month)
      );

      res.json({
        success: true,
        message: 'Monthly analytics recalculated successfully',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Recalculate all monthly analytics
   */
  static async recalculateAllAnalytics(req, res) {
    try {
      const analytics = await AnalyticsService.recalculateAllMonthlyAnalytics();

      res.json({
        success: true,
        message: 'All monthly analytics recalculated successfully',
        data: analytics,
        count: analytics.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AnalyticsController;

