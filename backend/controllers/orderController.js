const OrderService = require('../services/orderService');

class OrderController {
  // Create a new order
  static async createOrder(req, res) {
    try {
      const orderData = {
        ...req.body,
        sellerInfo: {
          sellerId: req.body.sellerInfo?.sellerId || 'demo_seller_123',
          sellerName: req.body.sellerInfo?.sellerName || 'Demo Seller'
        }
      };

      const order = await OrderService.createOrder(orderData);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all orders for a seller
  static async getOrders(req, res) {
    try {
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const filters = {
        status: req.query.status,
        productId: req.query.productId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      };

      const orders = await OrderService.getOrdersBySeller(sellerId, filters);
      
      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
        count: orders.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.query.sellerId || 'demo_seller_123';

      const order = await OrderService.getOrderById(id, sellerId);
      
      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by order number
  static async getOrderByNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      const sellerId = req.query.sellerId || 'demo_seller_123';

      const order = await OrderService.getOrderByNumber(orderNumber, sellerId);
      
      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const { status, ...additionalData } = req.body;

      const order = await OrderService.updateOrderStatus(id, sellerId, status, additionalData);
      
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update order details
  static async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const updateData = req.body;

      const order = await OrderService.updateOrder(id, sellerId, updateData);
      
      res.json({
        success: true,
        message: 'Order updated successfully',
        data: order
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete order (soft delete)
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const { reason } = req.body;

      const order = await OrderService.deleteOrder(id, sellerId, reason);
      
      res.json({
        success: true,
        message: 'Order deleted successfully',
        data: order
      });
    } catch (error) {
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order statistics
  static async getOrderStatistics(req, res) {
    try {
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const dateRange = {
        from: req.query.dateFrom,
        to: req.query.dateTo
      };

      const stats = await OrderService.getOrderStatistics(sellerId, dateRange);
      
      res.json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Search orders
  static async searchOrders(req, res) {
    try {
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const { q } = req.query;

      const orders = await OrderService.searchOrders(sellerId, q);
      
      res.json({
        success: true,
        message: 'Search completed successfully',
        data: orders,
        count: orders.length,
        query: q
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get orders by status
  static async getOrdersByStatus(req, res) {
    try {
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const { status } = req.params;

      const orders = await OrderService.getOrdersByStatus(sellerId, status);
      
      res.json({
        success: true,
        message: `Orders with status '${status}' retrieved successfully`,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bulk update orders
  static async bulkUpdateOrders(req, res) {
    try {
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const { orderIds, updateData } = req.body;

      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order IDs array is required'
        });
      }

      const result = await OrderService.bulkUpdateOrders(orderIds, sellerId, updateData);
      
      res.json({
        success: true,
        message: 'Orders updated successfully',
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get recent orders (last 7 days)
  static async getRecentOrders(req, res) {
    try {
      const sellerId = req.query.sellerId || 'demo_seller_123';
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const filters = {
        dateFrom: sevenDaysAgo.toISOString(),
        dateTo: new Date().toISOString(),
        limit: parseInt(req.query.limit) || 20
      };

      const orders = await OrderService.getOrdersBySeller(sellerId, filters);
      
      res.json({
        success: true,
        message: 'Recent orders retrieved successfully',
        data: orders,
        count: orders.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = OrderController;
