const mongoose = require('mongoose');

const monthlyAnalyticsSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalReceivedAmount: {
    type: Number,
    default: 0
  },
  pendingOrders: {
    type: Number,
    default: 0
  },
  deliveredOrders: {
    type: Number,
    default: 0
  },
  cancelledOrders: {
    type: Number,
    default: 0
  },
  ordersByType: {
    cod: {
      type: Number,
      default: 0
    },
    online: {
      type: Number,
      default: 0
    },
    wallet: {
      type: Number,
      default: 0
    }
  },
  revenueByType: {
    cod: {
      type: Number,
      default: 0
    },
    online: {
      type: Number,
      default: 0
    },
    wallet: {
      type: Number,
      default: 0
    }
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  cancellationRate: {
    type: Number,
    default: 0
  },
  paymentStats: {
    paidOrders: {
      type: Number,
      default: 0
    },
    unpaidOrders: {
      type: Number,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    unpaidAmount: {
      type: Number,
      default: 0
    }
  },
  topProducts: [{
    productId: String,
    productName: String,
    orderCount: Number,
    totalRevenue: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for year and month
monthlyAnalyticsSchema.index({ year: 1, month: 1 }, { unique: true });

// Static method to get or create analytics for a specific month
monthlyAnalyticsSchema.statics.getOrCreate = async function(year, month) {
  let analytics = await this.findOne({ year, month });
  
  if (!analytics) {
    analytics = await this.create({ year, month });
  }
  
  return analytics;
};

// Static method to get analytics for a date range
monthlyAnalyticsSchema.statics.getAnalytics = async function(startYear, startMonth, endYear, endMonth) {
  const query = {
    $or: []
  };
  
  // Build query for date range
  if (startYear === endYear) {
    query.$or.push({
      year: startYear,
      month: { $gte: startMonth, $lte: endMonth }
    });
  } else {
    // Start year months
    query.$or.push({
      year: startYear,
      month: { $gte: startMonth }
    });
    
    // Years in between
    if (endYear - startYear > 1) {
      query.$or.push({
        year: { $gt: startYear, $lt: endYear }
      });
    }
    
    // End year months
    query.$or.push({
      year: endYear,
      month: { $lte: endMonth }
    });
  }
  
  return this.find(query).sort({ year: -1, month: -1 });
};

// Instance method to update analytics
monthlyAnalyticsSchema.methods.recalculate = async function(orders) {
  // Reset counters
  this.totalOrders = orders.length;
  this.totalRevenue = 0;
  this.totalReceivedAmount = 0;
  this.pendingOrders = 0;
  this.deliveredOrders = 0;
  this.cancelledOrders = 0;
  this.ordersByType = { cod: 0, online: 0, wallet: 0 };
  this.revenueByType = { cod: 0, online: 0, wallet: 0 };
  this.paymentStats = {
    paidOrders: 0,
    unpaidOrders: 0,
    paidAmount: 0,
    unpaidAmount: 0
  };

  const productMap = new Map();

  // Calculate statistics
  orders.forEach(order => {
    // Total revenue
    this.totalRevenue += order.amount || 0;
    this.totalReceivedAmount += order.receivedAmount || 0;

    // Status counts
    if (order.status === 'pending') this.pendingOrders++;
    else if (order.status === 'delivered') this.deliveredOrders++;
    else if (order.status === 'cancelled') this.cancelledOrders++;

    // Payment method counts
    const paymentMethod = order.paymentInfo?.paymentMethod || 'cod';
    this.ordersByType[paymentMethod] = (this.ordersByType[paymentMethod] || 0) + 1;
    this.revenueByType[paymentMethod] = (this.revenueByType[paymentMethod] || 0) + (order.amount || 0);

    // Payment stats
    if (order.paymentSubstate?.isPaid) {
      this.paymentStats.paidOrders++;
      this.paymentStats.paidAmount += order.paymentSubstate.paidAmount || 0;
    } else {
      this.paymentStats.unpaidOrders++;
      this.paymentStats.unpaidAmount += order.amount || 0;
    }

    // Track products
    if (order.productId && order.productName) {
      if (!productMap.has(order.productId)) {
        productMap.set(order.productId, {
          productId: order.productId,
          productName: order.productName,
          orderCount: 0,
          totalRevenue: 0
        });
      }
      const product = productMap.get(order.productId);
      product.orderCount++;
      product.totalRevenue += order.amount || 0;
    }
  });

  // Calculate rates
  this.averageOrderValue = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;
  this.completionRate = this.totalOrders > 0 ? (this.deliveredOrders / this.totalOrders) * 100 : 0;
  this.cancellationRate = this.totalOrders > 0 ? (this.cancelledOrders / this.totalOrders) * 100 : 0;

  // Top 10 products by revenue
  this.topProducts = Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  this.lastUpdated = new Date();

  return this.save();
};

module.exports = mongoose.model('MonthlyAnalytics', monthlyAnalyticsSchema);

