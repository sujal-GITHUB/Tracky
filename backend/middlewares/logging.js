const morgan = require('morgan');
const config = require('../config');

// Custom morgan token for request ID
morgan.token('reqId', (req) => req.id || 'unknown');

// Custom morgan token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.get('X-Response-Time');
  return responseTime ? `${responseTime}ms` : 'unknown';
});

// Custom morgan token for user agent
morgan.token('user-agent', (req) => req.get('User-Agent') || 'unknown');

// Development logging format
const devFormat = ':reqId :method :url :status :response-time-ms - :res[content-length] bytes - :user-agent';

// Production logging format (more concise)
const prodFormat = ':reqId :method :url :status :response-time-ms :res[content-length]';

// Create morgan middleware based on environment
const createLogger = () => {
  if (config.nodeEnv === 'development') {
    return morgan(devFormat, {
      skip: (req, res) => res.statusCode < 400 // Skip successful requests in dev
    });
  } else {
    return morgan(prodFormat, {
      skip: (req, res) => res.statusCode < 400 // Skip successful requests in prod
    });
  }
};

// Request ID middleware
const requestId = (req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.set('X-Request-ID', req.id);
  next();
};

// Response time middleware
const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.set('X-Response-Time', duration.toString());
    }
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error ${req.id}:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  next(err);
};

module.exports = {
  createLogger,
  requestId,
  responseTime,
  errorLogger
};
