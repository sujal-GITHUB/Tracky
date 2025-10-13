const jwt = require('jsonwebtoken');
const config = require('../config');

// Simple authentication middleware (for demo purposes)
// In production, you would implement proper user authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to validate seller ID
const validateSellerId = (req, res, next) => {
  const sellerId = req.params.sellerId || req.body.sellerId || req.query.sellerId;
  
  if (!sellerId) {
    return res.status(400).json({
      success: false,
      message: 'Seller ID is required'
    });
  }

  req.sellerId = sellerId;
  next();
};

// Middleware to check if user is authorized to access seller data
const authorizeSeller = (req, res, next) => {
  const requestedSellerId = req.params.sellerId || req.body.sellerId || req.query.sellerId;
  const userSellerId = req.user?.sellerId;

  if (!userSellerId) {
    return res.status(401).json({
      success: false,
      message: 'User seller ID not found'
    });
  }

  if (requestedSellerId && requestedSellerId !== userSellerId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this seller\'s data'
    });
  }

  req.sellerId = userSellerId;
  next();
};

// Optional authentication middleware (for public endpoints)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  validateSellerId,
  authorizeSeller,
  optionalAuth
};
