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
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'delivered', 'cancelled'],
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: String,
      enum: ['customer', 'seller', 'admin', 'system'],
      default: 'system'
    },
    reason: {
      type: String,
      trim: true
    }
  }],
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
  paymentSubstate: {
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'digital_wallet', 'other'],
      trim: true
    },
    paymentReference: {
      type: String,
      trim: true
    }
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
  return this.paymentSubstate.isPaid;
});

// Virtual for payment status text
orderSchema.virtual('paymentStatusText').get(function() {
  if (this.status === 'pending') {
    return 'Pending';
  }
  return this.paymentSubstate.isPaid ? 'Paid' : 'Unpaid';
});

// Virtual for last status change date
orderSchema.virtual('lastStatusChange').get(function() {
  if (this.statusHistory && this.statusHistory.length > 0) {
    const latest = this.statusHistory.sort((a, b) => b.changedAt - a.changedAt)[0];
    return latest.changedAt;
  }
  return this.createdAt;
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

// Instance method to change order status
orderSchema.methods.changeStatus = function(newStatus, changedBy = 'system', reason = null) {
  // Validate status transition - once delivered or cancelled, cannot change to the other final state
  const validTransitions = {
    'pending': ['delivered', 'cancelled'],
    'delivered': ['pending'], // Can only go back to pending, not to cancelled
    'cancelled': ['pending']  // Can only go back to pending, not to delivered
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}. Once an order is ${this.status}, it cannot be changed to ${newStatus === 'delivered' ? 'cancelled' : 'delivered'}.`);
  }

  // Add current status to history before changing
  this.statusHistory.push({
    status: this.status,
    changedAt: new Date(),
    changedBy: changedBy,
    reason: reason
  });

  // Update status
  this.status = newStatus;

  // Reset payment substate when changing to delivered or cancelled
  if (newStatus === 'delivered' || newStatus === 'cancelled') {
    this.paymentSubstate.isPaid = false;
    this.paymentSubstate.paidAmount = 0;
    this.paymentSubstate.paymentDate = null;
    this.paymentSubstate.paymentMethod = null;
    this.paymentSubstate.paymentReference = null;
  }

  return this.save();
};

// Instance method to mark payment as received
orderSchema.methods.markPaymentReceived = function(amount, paymentMethod = null, paymentReference = null) {
  // Check if order is in delivered or cancelled state
  if (this.status !== 'delivered' && this.status !== 'cancelled') {
    throw new Error('Payment can only be marked for delivered or cancelled orders');
  }

  // Validate amount
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  if (amount > this.amount) {
    throw new Error('Payment amount cannot exceed order amount');
  }

  // Update payment substate
  this.paymentSubstate.isPaid = true;
  this.paymentSubstate.paidAmount = amount;
  this.paymentSubstate.paymentDate = new Date();
  this.paymentSubstate.paymentMethod = paymentMethod;
  this.paymentSubstate.paymentReference = paymentReference;

  // Update received amount
  this.receivedAmount = amount;

  return this.save();
};

// Instance method to mark payment as not received
orderSchema.methods.markPaymentNotReceived = function() {
  // Check if order is in delivered or cancelled state
  if (this.status !== 'delivered' && this.status !== 'cancelled') {
    throw new Error('Payment status can only be changed for delivered or cancelled orders');
  }

  // Reset payment substate
  this.paymentSubstate.isPaid = false;
  this.paymentSubstate.paidAmount = 0;
  this.paymentSubstate.paymentDate = null;
  this.paymentSubstate.paymentMethod = null;
  this.paymentSubstate.paymentReference = null;

  // Reset received amount
  this.receivedAmount = 0;

  return this.save();
};

// Instance method to get current payment status
orderSchema.methods.getPaymentStatus = function() {
  if (this.status === 'pending') {
    return 'pending';
  }
  
  return this.paymentSubstate.isPaid ? 'paid' : 'unpaid';
};

// Instance method to get status change history
orderSchema.methods.getStatusHistory = function() {
  return this.statusHistory.sort((a, b) => b.changedAt - a.changedAt);
};

module.exports = mongoose.model('Order', orderSchema);
