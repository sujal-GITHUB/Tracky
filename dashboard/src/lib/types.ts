// User/Seller types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'SELLER';
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerInfo {
  sellerId: string;
  sellerName: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}

export interface ShippingInfo {
  trackingNumber?: string;
  courierService?: string;
  estimatedDelivery?: string;
}

export interface PaymentInfo {
  paymentMethod: 'cod' | 'online' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
}

// Order types matching backend model
export interface Order {
  _id: string;
  orderNumber: string;
  productName: string;
  productId: string;
  dateOfDeparture: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'received' | 'cancelled';
  amount: number;
  receivedAmount: number;
  customerInfo: CustomerInfo;
  sellerInfo: SellerInfo;
  shippingInfo?: ShippingInfo;
  paymentInfo?: PaymentInfo;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'seller' | 'admin';
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  orderAge?: number;
  isDelivered?: boolean;
  isCancelled?: boolean;
}

// Order statistics
export interface OrderStats {
  totalOrders: number;
  totalAmount: number;
  totalReceivedAmount: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

// Order form data for creating/updating orders
export interface OrderFormData {
  productName: string;
  productId: string;
  dateOfDeparture: string;
  amount: number;
  customerInfo: CustomerInfo;
  sellerInfo: SellerInfo;
  shippingInfo?: Partial<ShippingInfo>;
  paymentInfo?: Partial<PaymentInfo>;
  notes?: string;
}

// Order status update data
export interface OrderStatusUpdate {
  status: Order['status'];
  receivedAmount?: number;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'seller' | 'admin';
  trackingNumber?: string;
  courierService?: string;
  estimatedDelivery?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  count: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter and search types
export interface OrderFilters {
  status?: Order['status'];
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  skip?: number;
}

export interface SearchParams {
  q: string;
}

// Dashboard types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  recentOrders: Order[];
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Utility types
export type OrderStatus = Order['status'];
export type PaymentMethod = PaymentInfo['paymentMethod'];
export type PaymentStatus = PaymentInfo['paymentStatus'];
