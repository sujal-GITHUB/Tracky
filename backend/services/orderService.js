const Order = require('../models/Order');

class OrderService {
  // Create a new order
  static async createOrder(orderData) {
    try {
      const order = new Order(orderData);
      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Get all orders for a seller
  static async getOrdersBySeller(sellerId, filters = {}) {
    try {
      const query = { 'sellerInfo.sellerId': sellerId };
      
      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.productId) {
        query.productId = filters.productId;
      }
      if (filters.dateFrom && filters.dateTo) {
        query.createdAt = {
          $gte: new Date(filters.dateFrom),
          $lte: new Date(filters.dateTo)
        };
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0);

      return orders;
    } catch (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  }

  // Get order by ID
  static async getOrderById(orderId, sellerId) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        'sellerInfo.sellerId': sellerId
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber, sellerId) {
    try {
      const order = await Order.findOne({
        orderNumber: orderNumber,
        'sellerInfo.sellerId': sellerId
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, sellerId, newStatus, additionalData = {}) {
    try {
      const updateData = { status: newStatus };

      // Add additional data based on status
      switch (newStatus) {
        case 'pending':
          // For pending orders, received amount is typically 0
          if (additionalData.receivedAmount !== undefined) {
            updateData.receivedAmount = additionalData.receivedAmount;
          }
          break;
        case 'delivered':
          updateData.receivedAmount = additionalData.receivedAmount || 0;
          break;
        case 'cancelled':
          updateData.cancellationReason = additionalData.cancellationReason;
          updateData.cancelledBy = additionalData.cancelledBy || 'seller';
          updateData.cancelledAt = new Date();
          // If cancelled, set received amount to 0 unless specified otherwise
          if (additionalData.receivedAmount === undefined) {
            updateData.receivedAmount = 0;
          }
          break;
      }

      const order = await Order.findOneAndUpdate(
        { _id: orderId, 'sellerInfo.sellerId': sellerId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Update order details
  static async updateOrder(orderId, sellerId, updateData) {
    try {
      const order = await Order.findOneAndUpdate(
        { _id: orderId, 'sellerInfo.sellerId': sellerId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }

  // Delete order (soft delete by marking as cancelled)
  static async deleteOrder(orderId, sellerId, reason = 'Deleted by seller') {
    try {
      const order = await Order.findOneAndUpdate(
        { _id: orderId, 'sellerInfo.sellerId': sellerId },
        {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledBy: 'seller',
          cancelledAt: new Date()
        },
        { new: true }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }

  // Get order statistics for a seller
  static async getOrderStatistics(sellerId, dateRange = {}) {
    try {
      const matchQuery = { 'sellerInfo.sellerId': sellerId };
      
      if (dateRange.from && dateRange.to) {
        matchQuery.createdAt = {
          $gte: new Date(dateRange.from),
          $lte: new Date(dateRange.to)
        };
      }

      const stats = await Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalReceivedAmount: { $sum: '$receivedAmount' },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            pendingWithPayment: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$status', 'pending'] },
                      { $gt: ['$receivedAmount', 0] }
                    ]
                  }, 
                  1, 
                  0
                ]
              }
            },
            pendingWithoutPayment: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$status', 'pending'] },
                      { $eq: ['$receivedAmount', 0] }
                    ]
                  }, 
                  1, 
                  0
                ]
              }
            },
            deliveredWithPayment: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$status', 'delivered'] },
                      { $gt: ['$receivedAmount', 0] }
                    ]
                  }, 
                  1, 
                  0
                ]
              }
            },
            deliveredWithoutPayment: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$status', 'delivered'] },
                      { $eq: ['$receivedAmount', 0] }
                    ]
                  }, 
                  1, 
                  0
                ]
              }
            },
            cancelledWithPayment: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$status', 'cancelled'] },
                      { $gt: ['$receivedAmount', 0] }
                    ]
                  }, 
                  1, 
                  0
                ]
              }
            },
            cancelledWithoutPayment: {
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$status', 'cancelled'] },
                      { $eq: ['$receivedAmount', 0] }
                    ]
                  }, 
                  1, 
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || {
        totalOrders: 0,
        totalAmount: 0,
        totalReceivedAmount: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        pendingWithPayment: 0,
        pendingWithoutPayment: 0,
        deliveredWithPayment: 0,
        deliveredWithoutPayment: 0,
        cancelledWithPayment: 0,
        cancelledWithoutPayment: 0
      };
    } catch (error) {
      throw new Error(`Failed to fetch order statistics: ${error.message}`);
    }
  }

  // Search orders
  static async searchOrders(sellerId, searchQuery) {
    try {
      const query = {
        'sellerInfo.sellerId': sellerId,
        $or: [
          { orderNumber: { $regex: searchQuery, $options: 'i' } },
          { productName: { $regex: searchQuery, $options: 'i' } },
          { productId: { $regex: searchQuery, $options: 'i' } }
        ]
      };

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      throw new Error(`Failed to search orders: ${error.message}`);
    }
  }

  // Get orders by status
  static async getOrdersByStatus(sellerId, status) {
    try {
      const orders = await Order.find({
        'sellerInfo.sellerId': sellerId,
        status: status
      }).sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      throw new Error(`Failed to fetch orders by status: ${error.message}`);
    }
  }

  // Bulk update orders
  static async bulkUpdateOrders(orderIds, sellerId, updateData) {
    try {
      const result = await Order.updateMany(
        { 
          _id: { $in: orderIds },
          'sellerInfo.sellerId': sellerId 
        },
        updateData
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to bulk update orders: ${error.message}`);
    }
  }
}

module.exports = OrderService;
