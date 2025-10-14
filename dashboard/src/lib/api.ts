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

// Request interceptor (no authentication needed)
api.interceptors.request.use(
  (config) => {
    // No authentication headers needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (no authentication handling needed)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just log errors, no authentication handling
    console.error('API Error:', error.response?.data?.message || error.message);
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
  getOrderStatistics: (params?: { from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.append('dateFrom', params.from);
    if (params?.to) searchParams.append('dateTo', params.to);
    return api.get(`/statistics?${searchParams.toString()}`);
  },
  
  // Bulk update orders
  bulkUpdateOrders: (orderIds: string[], updateData: any) => 
    api.patch('/bulk/update', { orderIds, updateData }),
  
  // Health check
  healthCheck: () => api.get('/health'),

  // Toggle payment status
  togglePaymentStatus: (id: string, receivedAmount: number) => 
    api.patch(`/${id}/payment`, { receivedAmount }),
};

export default api;
