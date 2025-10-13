'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Package, User, MapPin, CreditCard, Calendar, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderAPI } from '@/lib/api';
import { Order, OrderStatusUpdate } from '@/lib/types';
import { formatPrice, formatDate, getStatusBadgeColor, getOrderStatusIcon } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrderById(params.id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updateData: OrderStatusUpdate = {
        status: newStatus as any,
      };

      // Add specific data based on status
      if (newStatus === 'delivered') {
        updateData.receivedAmount = order.amount;
      }

      const response = await orderAPI.updateOrderStatus(order._id, updateData);
      setOrder(response.data.data);
      
      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || 'Failed to update order status',
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;

    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setUpdating(true);
    try {
      await orderAPI.deleteOrder(order._id, 'Deleted by admin');
      
      toast({
        title: "Order Deleted",
        description: "Order has been successfully deleted",
        variant: "default",
      });

      router.push('/admin/orders');
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || 'Failed to delete order',
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-black dark:text-white">Order not found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The order you're looking for doesn't exist.
        </p>
        <div className="mt-4">
          <Button onClick={() => router.push('/admin/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/admin/orders/${order._id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteOrder} disabled={updating}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Name</Label>
                  <p className="text-lg font-medium text-black dark:text-white">{order.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Product ID</Label>
                  <p className="text-lg font-medium text-black dark:text-white">{order.productId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Amount</Label>
                  <p className="text-lg font-medium text-black dark:text-white">{formatPrice(order.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Received Amount</Label>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    {formatPrice(order.receivedAmount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Departure</Label>
                  <p className="text-lg font-medium text-black dark:text-white">
                    {formatDate(order.dateOfDeparture)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Age</Label>
                  <p className="text-lg font-medium text-black dark:text-white">
                    {order.orderAge || 0} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Name</Label>
                  <p className="text-lg font-medium text-black dark:text-white">{order.customerInfo.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</Label>
                  <p className="text-lg font-medium text-black dark:text-white">{order.customerInfo.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</Label>
                  <p className="text-lg font-medium text-black dark:text-white">{order.customerInfo.address}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pincode: {order.customerInfo.pincode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {order.shippingInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {order.shippingInfo.trackingNumber && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tracking Number</Label>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {order.shippingInfo.trackingNumber}
                      </p>
                    </div>
                  )}
                  {order.shippingInfo.courierService && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Courier Service</Label>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {order.shippingInfo.courierService}
                      </p>
                    </div>
                  )}
                  {order.shippingInfo.estimatedDelivery && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Delivery</Label>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {formatDate(order.shippingInfo.estimatedDelivery)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          {order.paymentInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</Label>
                    <p className="text-lg font-medium text-black dark:text-white capitalize">
                      {order.paymentInfo.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Status</Label>
                    <p className="text-lg font-medium text-black dark:text-white capitalize">
                      {order.paymentInfo.paymentStatus}
                    </p>
                  </div>
                  {order.paymentInfo.transactionId && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction ID</Label>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {order.paymentInfo.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Information */}
          {order.status === 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Cancellation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled By</Label>
                    <p className="text-lg font-medium text-black dark:text-white capitalize">
                      {order.cancelledBy || 'Unknown'}
                    </p>
                  </div>
                  {order.cancelledAt && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled At</Label>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {formatDate(order.cancelledAt)}
                      </p>
                    </div>
                  )}
                </div>
                {order.cancellationReason && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reason</Label>
                    <p className="text-gray-700 dark:text-gray-300">{order.cancellationReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Actions */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>
                Update the order status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                  <span className="mr-2">{getOrderStatusIcon(order.status)}</span>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Change Status</Label>
                <Select 
                  value={order.status} 
                  onValueChange={handleStatusUpdate}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="font-medium">{formatDate(order.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order Amount:</span>
                <span className="font-medium">{formatPrice(order.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Received:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatPrice(order.receivedAmount)}
                </span>
              </div>
              <hr className="border-gray-200 dark:border-gray-600" />
              <div className="flex justify-between font-semibold">
                <span>Outstanding:</span>
                <span className="text-orange-600 dark:text-orange-400">
                  {formatPrice(order.amount - order.receivedAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}