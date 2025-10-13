const request = require('supertest');
const app = require('../app');

describe('Order API Tests', () => {
  // Mock JWT token for testing
  const mockToken = 'mock-jwt-token';
  
  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/orders/health')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('healthy');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Tracky Order Management API');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/non-existent-route')
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for protected routes', async () => {
      const res = await request(app)
        .get('/api/orders')
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access token required');
    });
  });
});

module.exports = {};
