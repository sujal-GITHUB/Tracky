'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Order } from '@/lib/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // Since there's no direct admin endpoint for single order, we'll get all orders and filter
      const response = await api.get('/orders/admin/all?limit=1000');
      const orders = response.data.data?.orders || [];
      const foundOrder = orders.find((o: Order) => o.id === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
        setTrackingNumber(foundOrder.trackingNumber || '');
      } else {
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus as any });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!order) return;
    
    setUpdating(true);
    try {
      await api.put(`/orders/admin/${orderId}/tracking`, { trackingNumber });
      setOrder({ ...order, trackingNumber });
    } catch (error) {
      console.error('Failed to update tracking number:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update tracking number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Order not found</div>
      </div>
    );
  }

  const orderStatuses = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Order #{order.id.slice(-8)}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-black dark:text-white">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="mt-1 text-sm text-black dark:text-white">{order.user?.name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-black dark:text-white">{order.user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="mt-1 text-sm text-black dark:text-white">{order.user?.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                <dd className="mt-1 text-sm text-black dark:text-white">{order.user?.role}</dd>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-black dark:text-white">Shipping Address</h3>
              </div>
              <p className="text-sm text-black dark:text-white">{order.shippingAddress}</p>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-black dark:text-white">Order Items</h3>
            </div>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-500 pb-4">
                  <img
                    className="h-16 w-16 rounded-lg object-cover"
                    src={item.product.imageUrl}
                    alt={item.product.name}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-black dark:text-white">{item.product.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price: {formatPrice(item.price)}</p>
                  </div>
                  <div className="text-sm font-medium text-black dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-500">
              <div className="flex justify-between text-lg font-medium text-black dark:text-white">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Management */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">Order Status</h3>
            <Select value={order.status} onValueChange={handleStatusUpdate} disabled={updating}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tracking Information */}
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
            <div className="flex items-center mb-4">
              <Truck className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-black dark:text-white">Tracking Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleTrackingUpdate}
                disabled={updating || !trackingNumber}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Update Tracking'}
              </Button>
            </div>
          </div>

          {/* Payment Information */}
          {order.payment && (
            <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
              <h3 className="text-lg font-medium text-black dark:text-white mb-4">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="text-sm font-medium text-black dark:text-white">{formatPrice(order.payment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Method</span>
                  <span className="text-sm font-medium text-black dark:text-white">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`text-sm font-medium ${
                    order.payment.status === 'COMPLETED' ? 'text-green-600' :
                    order.payment.status === 'PENDING' ? 'text-yellow-600' :
                    order.payment.status === 'FAILED' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {order.payment.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
              <h3 className="text-lg font-medium text-black dark:text-white mb-4">Order Notes</h3>
              <p className="text-sm text-black dark:text-white">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
