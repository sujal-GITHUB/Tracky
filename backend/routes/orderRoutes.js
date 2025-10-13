const express = require('express');
const OrderController = require('../controllers/orderController');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Order service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Order CRUD operations
router.post('/',
  OrderController.createOrder
);

router.get('/',
  OrderController.getOrders
);

router.get('/recent',
  OrderController.getRecentOrders
);

router.get('/search',
  OrderController.searchOrders
);

router.get('/statistics',
  OrderController.getOrderStatistics
);

router.get('/status/:status',
  OrderController.getOrdersByStatus
);

router.get('/number/:orderNumber',
  OrderController.getOrderByNumber
);

router.get('/:id',
  OrderController.getOrderById
);

router.put('/:id',
  OrderController.updateOrder
);

router.patch('/:id/status',
  OrderController.updateOrderStatus
);

router.delete('/:id',
  OrderController.deleteOrder
);

// Bulk operations
router.patch('/bulk/update',
  OrderController.bulkUpdateOrders
);

module.exports = router;
