const express = require('express');
const OrderController = require('../controllers/orderController');
const { authenticateToken, authorizeSeller } = require('../middlewares/auth');
const {
  validateOrder,
  validateOrderUpdate,
  validateOrderId,
  validateQueryParams,
  validateSearchQuery
} = require('../middlewares/validation');
const {
  generalLimiter,
  orderCreationLimiter,
  searchLimiter
} = require('../middlewares/rateLimiting');

const router = express.Router();

// Apply rate limiting to all routes
router.use(generalLimiter);

// Public routes (with optional authentication)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Order service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Protected routes (require authentication)
router.use(authenticateToken);
router.use(authorizeSeller);

// Order CRUD operations
router.post('/',
  orderCreationLimiter,
  validateOrder,
  OrderController.createOrder
);

router.get('/',
  validateQueryParams,
  OrderController.getOrders
);

router.get('/recent',
  validateQueryParams,
  OrderController.getRecentOrders
);

router.get('/search',
  searchLimiter,
  validateSearchQuery,
  OrderController.searchOrders
);

router.get('/statistics',
  validateQueryParams,
  OrderController.getOrderStatistics
);

router.get('/status/:status',
  validateQueryParams,
  OrderController.getOrdersByStatus
);

router.get('/number/:orderNumber',
  OrderController.getOrderByNumber
);

router.get('/:id',
  validateOrderId,
  OrderController.getOrderById
);

router.put('/:id',
  validateOrderId,
  validateOrderUpdate,
  OrderController.updateOrder
);

router.patch('/:id/status',
  validateOrderId,
  validateOrderUpdate,
  OrderController.updateOrderStatus
);

router.delete('/:id',
  validateOrderId,
  OrderController.deleteOrder
);

// Bulk operations
router.patch('/bulk/update',
  OrderController.bulkUpdateOrders
);

module.exports = router;
