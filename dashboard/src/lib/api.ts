import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/orders';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

console.log('API Base URL:', API_BASE_URL);

// Request interceptor to add auth token (optional for demo)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('trackyToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // For demo purposes, add a default token
        config.headers.Authorization = `Bearer demo-token`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('trackyToken');
      // Don't redirect to login, just log the error
      console.warn('Authentication error:', error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

// Order API functions
export const orderAPI = {
  // Get all orders
  getOrders: (params = {}) => api.get('', { params }),
  
  // Get order by ID
  getOrderById: (id: string) => api.get(`/${id}`),
  
  // Get order by order number
  getOrderByNumber: (orderNumber: string) => api.get(`/number/${orderNumber}`),
  
  // Create new order
  createOrder: (orderData: any) => api.post('', orderData),
  
  // Update order
  updateOrder: (id: string, orderData: any) => api.put(`/${id}`, orderData),
  
  // Update order status
  updateOrderStatus: (id: string, statusData: any) => api.patch(`/${id}/status`, statusData),
  
  // Delete order
  deleteOrder: (id: string, reason?: string) => api.delete(`/${id}`, { data: { reason } }),
  
  // Search orders
  searchOrders: (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`),
  
  // Get orders by status
  getOrdersByStatus: (status: string) => api.get(`/status/${status}`),
  
  // Get recent orders
  getRecentOrders: (limit = 20) => api.get(`/recent?limit=${limit}`),
  
  // Get order statistics
  getOrderStatistics: (dateRange?: { from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('dateFrom', dateRange.from);
    if (dateRange?.to) params.append('dateTo', dateRange.to);
    return api.get(`/statistics?${params.toString()}`);
  },
  
  // Bulk update orders
  bulkUpdateOrders: (orderIds: string[], updateData: any) => 
    api.patch('/bulk/update', { orderIds, updateData }),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;
