// Utility functions for the application

// Generate a unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD${timestamp}${random}`.toUpperCase();
};

// Format currency
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
const formatDate = (date, format = 'DD/MM/YYYY') => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return d.toLocaleDateString();
  }
};

// Calculate order age in days
const calculateOrderAge = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Validate Indian phone number
const isValidIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Validate Indian pincode
const isValidIndianPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

// Generate pagination info
const generatePaginationInfo = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};

// Calculate order statistics
const calculateOrderStats = (orders) => {
  const stats = {
    totalOrders: orders.length,
    totalAmount: 0,
    totalReceivedAmount: 0,
    statusCounts: {},
    averageOrderValue: 0
  };

  orders.forEach(order => {
    stats.totalAmount += order.amount;
    // Only include amounts that have been explicitly marked as paid
    if (order.paymentSubstate && order.paymentSubstate.isPaid) {
      stats.totalReceivedAmount += order.paymentSubstate.paidAmount || 0;
    }
    
    if (!stats.statusCounts[order.status]) {
      stats.statusCounts[order.status] = 0;
    }
    stats.statusCounts[order.status]++;
  });

  stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalAmount / stats.totalOrders : 0;

  return stats;
};

// Generate random tracking number
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if order can be cancelled
const canCancelOrder = (order) => {
  const cancellableStatuses = ['pending', 'confirmed'];
  return cancellableStatuses.includes(order.status);
};

// Check if order can be updated
const canUpdateOrder = (order) => {
  const updatableStatuses = ['pending', 'confirmed', 'shipped'];
  return updatableStatuses.includes(order.status);
};

// Get order status color (for frontend)
const getOrderStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    received: '#059669',
    cancelled: '#ef4444'
  };
  return colors[status] || '#6b7280';
};

// Get order status text (for display)
const getOrderStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    received: 'Received',
    cancelled: 'Cancelled'
  };
  return texts[status] || 'Unknown';
};

module.exports = {
  generateOrderNumber,
  formatCurrency,
  formatDate,
  calculateOrderAge,
  isValidIndianPhone,
  isValidIndianPincode,
  sanitizeString,
  generatePaginationInfo,
  calculateOrderStats,
  generateTrackingNumber,
  canCancelOrder,
  canUpdateOrder,
  getOrderStatusColor,
  getOrderStatusText
};
