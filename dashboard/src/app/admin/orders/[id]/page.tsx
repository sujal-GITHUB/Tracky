'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Package, User, MapPin, CreditCard, Calendar, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPaymentAmountDialog, setShowPaymentAmountDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [cancellationReason, setCancellationReason] = useState('');
  const [orderId, setOrderId] = useState<string>('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const initializeOrder = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };
    initializeOrder();
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrderById(orderId);
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

  const handleStatusToggle = (newStatus: string) => {
    if (!order) return;
    
    // If changing from pending to delivered or cancelled, show payment dialog
    if (order.status === 'pending' && (newStatus === 'delivered' || newStatus === 'cancelled')) {
      setPendingStatusChange(newStatus);
      setReceivedAmount(order.amount);
      setPaymentReceived(false);
      setCancellationReason('');
      setShowPaymentDialog(true);
    } else {
      // Direct status update for other cases
      handleStatusUpdate(newStatus);
    }
  };

  const handleStatusUpdate = async (newStatus: string, additionalData: any = {}) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updateData: OrderStatusUpdate = {
        status: newStatus as any,
        ...additionalData
      };

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

  const handlePaymentDialogSubmit = async () => {
    if (!pendingStatusChange || !order) return;

    const additionalData: any = {};
    
    if (pendingStatusChange === 'delivered') {
      additionalData.receivedAmount = paymentReceived ? receivedAmount : 0;
    } else if (pendingStatusChange === 'cancelled') {
      additionalData.receivedAmount = paymentReceived ? receivedAmount : 0;
      additionalData.cancellationReason = cancellationReason || 'Cancelled by seller';
      additionalData.cancelledBy = 'seller';
    }

    setShowPaymentDialog(false);
    await handleStatusUpdate(pendingStatusChange, additionalData);
    setPendingStatusChange(null);
  };

  const handleTogglePayment = async (receivedAmount: number) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await orderAPI.togglePaymentStatus(order._id, receivedAmount);
      setOrder(response.data.data);
      
      toast({
        title: "Payment Status Updated",
        description: `Payment status updated successfully`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Failed to toggle payment status:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || 'Failed to update payment status',
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!order || paymentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (paymentAmount > order.amount) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount cannot exceed order amount",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await orderAPI.togglePaymentStatus(order._id, paymentAmount);
      setOrder(response.data.data);
      setShowPaymentAmountDialog(false);
      
      toast({
        title: "Payment Marked",
        description: `Payment of ${formatPrice(paymentAmount)} marked as received`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Failed to mark payment:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || 'Failed to mark payment',
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEditField = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: currentValue });
  };

  const handleSaveField = async (field: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updateData = { [field]: editValues[field] };
      const response = await orderAPI.updateOrder(order._id, updateData);
      setOrder(response.data.data);
      setEditingField(null);
      setEditValues({});
      
      toast({
        title: "Order Updated",
        description: `${field} updated successfully`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Failed to update order:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || 'Failed to update order',
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleDeleteOrder = async () => {
    if (!order) return;

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
      setShowDeleteConfirmDialog(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmDialog(true);
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
          <Button variant="destructive" onClick={handleDeleteClick} disabled={updating}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Order
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
                  {editingField === 'productName' ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={editValues.productName || ''}
                        onChange={(e) => setEditValues({...editValues, productName: e.target.value})}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleSaveField('productName')} disabled={updating}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-black dark:text-white">{order.productName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField('productName', order.productName)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Product ID</Label>
                  {editingField === 'productId' ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={editValues.productId || ''}
                        onChange={(e) => setEditValues({...editValues, productId: e.target.value})}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleSaveField('productId')} disabled={updating}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-black dark:text-white">{order.productId}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField('productId', order.productId)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Amount</Label>
                  {editingField === 'amount' ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type="number"
                        value={editValues.amount || ''}
                        onChange={(e) => setEditValues({...editValues, amount: Number(e.target.value)})}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleSaveField('amount')} disabled={updating}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-black dark:text-white">{formatPrice(order.amount)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField('amount', order.amount)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Received Amount</Label>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    {formatPrice(order.receivedAmount)}
                  </p>
                  {(order.status === 'delivered' || order.status === 'cancelled') && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => {
                          setPaymentAmount(order.amount);
                          setShowPaymentAmountDialog(true);
                        }}
                        disabled={updating}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Payment Received
                      </Button>
                    </div>
                  )}
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
                <Label>Change Status</Label>
                <div className="flex gap-2 mt-2">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusToggle('delivered')}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Delivered
                      </Button>
                      <Button
                        onClick={() => handleStatusToggle('cancelled')}
                        disabled={updating}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                  {(order.status === 'delivered' || order.status === 'cancelled') && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Status cannot be changed once order is {order.status}
                    </div>
                  )}
                </div>
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

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {pendingStatusChange === 'delivered' ? 'Mark as Delivered' : 'Cancel Order'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {pendingStatusChange === 'delivered' 
                  ? 'Please confirm if payment was received for this order.'
                  : 'Please provide details for cancelling this order.'
                }
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="paymentReceived"
                  checked={paymentReceived}
                  onChange={(e) => setPaymentReceived(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="paymentReceived">
                  Payment Received
                </Label>
              </div>
              
              {paymentReceived && (
                <div>
                  <Label htmlFor="receivedAmount">Received Amount</Label>
                  <Input
                    id="receivedAmount"
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(Number(e.target.value))}
                    placeholder="Enter received amount"
                    min="0"
                    max={order?.amount || 0}
                  />
                </div>
              )}
              
              {pendingStatusChange === 'cancelled' && (
                <div>
                  <Label htmlFor="cancellationReason">Cancellation Reason</Label>
                  <Textarea
                    id="cancellationReason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Enter reason for cancellation"
                    rows={3}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentDialogSubmit}
                disabled={updating}
                className={pendingStatusChange === 'delivered' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {updating ? 'Updating...' : (pendingStatusChange === 'delivered' ? 'Mark as Delivered' : 'Cancel Order')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Delete Order
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Are you sure you want to delete this order? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmDialog(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteOrder}
                disabled={updating}
              >
                {updating ? 'Deleting...' : 'Delete Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}