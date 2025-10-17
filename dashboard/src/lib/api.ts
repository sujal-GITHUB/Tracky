import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  getOrders: (params = {}) => api.get('/orders', { params }),
  
  // Get order by ID
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  
  // Get order by order number
  getOrderByNumber: (orderNumber: string) => api.get(`/orders/number/${orderNumber}`),
  
  // Create new order (with form data for file upload)
  createOrder: (orderData: any) => {
    const formData = new FormData();
    
    // Add all order data fields
    Object.keys(orderData).forEach(key => {
      if (key === 'sellerInfo' || key === 'paymentInfo' || key === 'shippingInfo') {
        formData.append(key, JSON.stringify(orderData[key]));
      } else if (key === 'invoice' && orderData[key]) {
        // Handle file upload
        formData.append('invoice', orderData[key]);
      } else if (orderData[key] !== undefined && orderData[key] !== null) {
        formData.append(key, orderData[key].toString());
      }
    });
    
    return api.post('/orders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update order
  updateOrder: (id: string, orderData: any) => api.put(`/orders/${id}`, orderData),
  
  // Update order status
  updateOrderStatus: (id: string, statusData: any) => api.patch(`/orders/${id}/status`, statusData),
  
  // Delete order
  deleteOrder: (id: string, reason?: string) => api.delete(`/orders/${id}`, { data: { reason } }),
  
  // Search orders
  searchOrders: (query: string) => api.get(`/orders/search?q=${encodeURIComponent(query)}`),
  
  // Get orders by status
  getOrdersByStatus: (status: string) => api.get(`/orders/status/${status}`),
  
  // Get recent orders
  getRecentOrders: (limit = 20) => api.get(`/orders/recent?limit=${limit}`),
  
  // Get order statistics
  getOrderStatistics: (params?: { from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.append('dateFrom', params.from);
    if (params?.to) searchParams.append('dateTo', params.to);
    return api.get(`/orders/statistics?${searchParams.toString()}`);
  },
  
  // Bulk update orders
  bulkUpdateOrders: (orderIds: string[], updateData: any) => 
    api.patch('/orders/bulk/update', { orderIds, updateData }),
  
  // Health check
  healthCheck: () => api.get('/orders/health'),

  // Toggle payment status
  togglePaymentStatus: (id: string, receivedAmount: number) => 
    api.patch(`/orders/${id}/payment`, { receivedAmount }),
};

// Analytics API functions
export const analyticsAPI = {
  // Get current month analytics
  getCurrentMonth: () => api.get('/analytics/current'),
  
  // Get analytics for a specific month
  getMonthlyAnalytics: (year: number, month: number) => 
    api.get(`/analytics/month/${year}/${month}`),
  
  // Get last N months analytics
  getLastNMonths: (months: number = 6) => 
    api.get(`/analytics/recent?months=${months}`),
  
  // Get yearly analytics
  getYearlyAnalytics: (year: number) => 
    api.get(`/analytics/year/${year}`),
  
  // Get analytics for a date range
  getAnalyticsRange: (startYear: number, startMonth: number, endYear: number, endMonth: number) => 
    api.get(`/analytics/range?startYear=${startYear}&startMonth=${startMonth}&endYear=${endYear}&endMonth=${endMonth}`),
  
  // Recalculate monthly analytics
  recalculateMonth: (year: number, month: number) => 
    api.post(`/analytics/recalculate/${year}/${month}`),
  
  // Recalculate all analytics
  recalculateAll: () => api.post('/analytics/recalculate-all'),
};

export default api;
