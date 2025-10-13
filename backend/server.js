const app = require('./app');
const config = require('./config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Tracky Order Management API Server Started
📡 Server running on port ${PORT}
🌍 Environment: ${config.nodeEnv}
📅 Started at: ${new Date().toISOString()}
🔗 API Base URL: http://localhost:${PORT}/api/orders
📊 Health Check: http://localhost:${PORT}/api/orders/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = server;
