const rateLimit = require('express-rate-limit');
const config = require('../config');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many sensitive requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation rate limiting
const orderCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 order creations per minute
  message: {
    success: false,
    message: 'Too many order creation requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiting
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: {
    success: false,
    message: 'Too many search requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  strictLimiter,
  orderCreationLimiter,
  searchLimiter
};
