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

export interface PaymentSubstate {
  isPaid: boolean;
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

// Order types matching backend model
export interface Order {
  _id: string;
  orderNumber: string;
  productName: string;
  productId: string;
  dateOfDeparture: string;
  status: 'pending' | 'delivered' | 'cancelled';
  amount: number;
  receivedAmount: number;
  sellerInfo: SellerInfo;
  shippingInfo?: ShippingInfo;
  paymentInfo?: PaymentInfo;
  paymentSubstate?: PaymentSubstate;
  notes?: string;
  invoicePath?: string;
  invoiceFileName?: string;
  invoiceUploadedAt?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'seller' | 'admin';
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  orderAge?: number;
  isDelivered?: boolean;
  isCancelled?: boolean;
  isPaymentReceived?: boolean;
}

// Order statistics
export interface OrderStats {
  totalOrders: number;
  totalAmount: number;
  totalReceivedAmount: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingWithPayment: number;
  pendingWithoutPayment: number;
  deliveredWithPayment: number;
  deliveredWithoutPayment: number;
  cancelledWithPayment: number;
  cancelledWithoutPayment: number;
  averageOrderValue: number;
}

// Order form data for creating/updating orders
export interface OrderFormData {
  orderNumber: string;
  productName: string;
  productId: string;
  amount: number;
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

// Monthly Analytics types
export interface MonthlyAnalytics {
  _id: string;
  year: number;
  month: number;
  totalOrders: number;
  totalRevenue: number;
  totalReceivedAmount: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  ordersByType: {
    cod: number;
    online: number;
    wallet: number;
  };
  revenueByType: {
    cod: number;
    online: number;
    wallet: number;
  };
  averageOrderValue: number;
  completionRate: number;
  cancellationRate: number;
  paymentStats: {
    paidOrders: number;
    unpaidOrders: number;
    paidAmount: number;
    unpaidAmount: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    orderCount: number;
    totalRevenue: number;
  }>;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface YearlyAnalytics {
  year: number;
  totalOrders: number;
  totalRevenue: number;
  totalReceivedAmount: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  completionRate: number;
  cancellationRate: number;
  monthlyData: MonthlyAnalytics[];
}

// Utility types
export type OrderStatus = Order['status'];
export type PaymentMethod = PaymentInfo['paymentMethod'];
export type PaymentStatus = PaymentInfo['paymentStatus'];
