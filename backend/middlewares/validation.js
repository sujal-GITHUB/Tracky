const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Order validation rules
const validateOrder = [
  body('productName')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Product ID must be between 1 and 50 characters'),
  
  body('dateOfDeparture')
    .notEmpty()
    .withMessage('Date of departure is required')
    .isISO8601()
    .withMessage('Date of departure must be a valid date'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be greater than or equal to 0'),
  
  body('sellerInfo.sellerId')
    .notEmpty()
    .withMessage('Seller ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Seller ID must be between 1 and 50 characters'),
  
  body('sellerInfo.sellerName')
    .notEmpty()
    .withMessage('Seller name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Seller name must be between 2 and 50 characters'),
  
  handleValidationErrors
];

// Order update validation rules
const validateOrderUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, delivered, cancelled'),
  
  body('receivedAmount')
    .optional()
    .isNumeric()
    .withMessage('Received amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Received amount must be greater than or equal to 0'),
  
  body('cancellationReason')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Cancellation reason must be between 5 and 200 characters'),
  
  body('cancelledBy')
    .optional()
    .isIn(['customer', 'seller', 'admin'])
    .withMessage('Cancelled by must be one of: customer, seller, admin'),
  
  body('shippingInfo.trackingNumber')
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage('Tracking number must be between 5 and 50 characters'),
  
  body('shippingInfo.courierService')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Courier service must be between 2 and 50 characters'),
  
  body('shippingInfo.estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery must be a valid date'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  handleValidationErrors
];

// Order ID validation
const validateOrderId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  
  handleValidationErrors
];

// Seller ID validation
const validateSellerId = [
  param('sellerId')
    .notEmpty()
    .withMessage('Seller ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Seller ID must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Query parameters validation
const validateQueryParams = [
  query('status')
    .optional()
    .isIn(['pending', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, delivered, cancelled'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  
  handleValidationErrors
];

// Search query validation
const validateSearchQuery = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateOrder,
  validateOrderUpdate,
  validateOrderId,
  validateSellerId,
  validateQueryParams,
  validateSearchQuery,
  handleValidationErrors
};
