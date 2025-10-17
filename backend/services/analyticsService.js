const Order = require('../models/Order');
const MonthlyAnalytics = require('../models/MonthlyAnalytics');

class AnalyticsService {
  /**
   * Calculate and store monthly analytics for a specific month
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   * @returns {Promise<Object>} - The calculated analytics
   */
  static async calculateMonthlyAnalytics(year, month) {
    try {
      // Get or create analytics document for this month
      const analytics = await MonthlyAnalytics.getOrCreate(year, month);

      // Get all orders for this month
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

      const orders = await Order.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });

      // Recalculate analytics based on orders
      await analytics.recalculate(orders);

      return analytics;
    } catch (error) {
      throw new Error(`Failed to calculate monthly analytics: ${error.message}`);
    }
  }

  /**
   * Calculate analytics for current month
   * @returns {Promise<Object>} - The calculated analytics
   */
  static async calculateCurrentMonthAnalytics() {
    const now = new Date();
    return this.calculateMonthlyAnalytics(now.getFullYear(), now.getMonth() + 1);
  }

  /**
   * Recalculate analytics for all months that have orders
   * @returns {Promise<Array>} - Array of calculated analytics
   */
  static async recalculateAllMonthlyAnalytics() {
    try {
      // Get all orders
      const orders = await Order.find({}).sort({ createdAt: 1 });

      if (orders.length === 0) {
        return [];
      }

      // Group orders by year and month
      const ordersByMonth = new Map();

      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${month}`;

        if (!ordersByMonth.has(key)) {
          ordersByMonth.set(key, { year, month, orders: [] });
        }

        ordersByMonth.get(key).orders.push(order);
      });

      // Calculate analytics for each month
      const results = [];
      for (const [key, data] of ordersByMonth) {
        const analytics = await MonthlyAnalytics.getOrCreate(data.year, data.month);
        await analytics.recalculate(data.orders);
        results.push(analytics);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to recalculate all monthly analytics: ${error.message}`);
    }
  }

  /**
   * Get monthly analytics for a specific month
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   * @returns {Promise<Object>} - The analytics data
   */
  static async getMonthlyAnalytics(year, month) {
    try {
      const analytics = await MonthlyAnalytics.findOne({ year, month });

      if (!analytics) {
        // Calculate it if it doesn't exist
        return this.calculateMonthlyAnalytics(year, month);
      }

      return analytics;
    } catch (error) {
      throw new Error(`Failed to get monthly analytics: ${error.message}`);
    }
  }

  /**
   * Get analytics for a date range
   * @param {number} startYear - Start year
   * @param {number} startMonth - Start month (1-12)
   * @param {number} endYear - End year
   * @param {number} endMonth - End month (1-12)
   * @returns {Promise<Array>} - Array of analytics data
   */
  static async getAnalyticsRange(startYear, startMonth, endYear, endMonth) {
    try {
      const analytics = await MonthlyAnalytics.getAnalytics(
        startYear,
        startMonth,
        endYear,
        endMonth
      );

      return analytics;
    } catch (error) {
      throw new Error(`Failed to get analytics range: ${error.message}`);
    }
  }

  /**
   * Get analytics for the last N months
   * @param {number} months - Number of months to retrieve
   * @returns {Promise<Array>} - Array of analytics data
   */
  static async getLastNMonthsAnalytics(months = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months + 1);

      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

      return this.getAnalyticsRange(startYear, startMonth, endYear, endMonth);
    } catch (error) {
      throw new Error(`Failed to get last N months analytics: ${error.message}`);
    }
  }

  /**
   * Get yearly analytics summary
   * @param {number} year - The year
   * @returns {Promise<Object>} - Aggregated yearly analytics
   */
  static async getYearlyAnalytics(year) {
    try {
      const analytics = await MonthlyAnalytics.find({ year }).sort({ month: 1 });

      if (analytics.length === 0) {
        return {
          year,
          totalOrders: 0,
          totalRevenue: 0,
          totalReceivedAmount: 0,
          monthlyData: []
        };
      }

      // Aggregate yearly totals
      const yearlyTotals = analytics.reduce((acc, month) => {
        acc.totalOrders += month.totalOrders;
        acc.totalRevenue += month.totalRevenue;
        acc.totalReceivedAmount += month.totalReceivedAmount;
        acc.pendingOrders += month.pendingOrders;
        acc.deliveredOrders += month.deliveredOrders;
        acc.cancelledOrders += month.cancelledOrders;
        return acc;
      }, {
        totalOrders: 0,
        totalRevenue: 0,
        totalReceivedAmount: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      });

      return {
        year,
        ...yearlyTotals,
        averageOrderValue: yearlyTotals.totalOrders > 0 
          ? yearlyTotals.totalRevenue / yearlyTotals.totalOrders 
          : 0,
        completionRate: yearlyTotals.totalOrders > 0
          ? (yearlyTotals.deliveredOrders / yearlyTotals.totalOrders) * 100
          : 0,
        cancellationRate: yearlyTotals.totalOrders > 0
          ? (yearlyTotals.cancelledOrders / yearlyTotals.totalOrders) * 100
          : 0,
        monthlyData: analytics
      };
    } catch (error) {
      throw new Error(`Failed to get yearly analytics: ${error.message}`);
    }
  }

  /**
   * Update analytics when a new order is created or modified
   * @param {Object} order - The order object
   * @returns {Promise<void>}
   */
  static async updateAnalyticsForOrder(order) {
    try {
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      await this.calculateMonthlyAnalytics(year, month);
    } catch (error) {
      console.error('Error updating analytics for order:', error.message);
      // Don't throw error - analytics update should not block order operations
    }
  }
}

module.exports = AnalyticsService;

