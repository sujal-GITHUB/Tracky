const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productId: {
    type: String,
    required: true,
    trim: true
  },
  dateOfDeparture: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'cancelled'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  receivedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  sellerInfo: {
    sellerId: {
      type: String,
      required: true,
      trim: true
    },
    sellerName: {
      type: String,
      required: true,
      trim: true
    }
  },
  shippingInfo: {
    trackingNumber: {
      type: String,
      trim: true
    },
    courierService: {
      type: String,
      trim: true
    },
    estimatedDelivery: {
      type: Date
    }
  },
  paymentInfo: {
    paymentMethod: {
      type: String,
      enum: ['cod', 'online', 'wallet'],
      default: 'cod'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    trim: true
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'sellerInfo.sellerId': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ dateOfDeparture: 1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for delivery status
orderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

// Virtual for cancellation status
orderSchema.virtual('isCancelled').get(function() {
  return this.status === 'cancelled';
});

// Virtual for payment status
orderSchema.virtual('isPaymentReceived').get(function() {
  return this.receivedAmount > 0;
});

// Pre-save middleware to generate order number if not provided
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Static method to get orders by seller
orderSchema.statics.getOrdersBySeller = function(sellerId, filters = {}) {
  return this.find({ 'sellerInfo.sellerId': sellerId, ...filters })
    .sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(sellerId) {
  return this.aggregate([
    { $match: { 'sellerInfo.sellerId': sellerId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalReceivedAmount: { $sum: '$receivedAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
