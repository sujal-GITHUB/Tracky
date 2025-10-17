'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package, User, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { orderAPI } from '@/lib/api';
import { OrderFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';

export default function CreateOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
   const [formData, setFormData] = useState<OrderFormData>({
     orderNumber: '',
     productName: '',
     productId: '',
     amount: 0,
     sellerInfo: {
       sellerId: 'admin_001',
       sellerName: 'Admin Seller'
     },
     paymentInfo: {
       paymentMethod: 'cod',
       paymentStatus: 'pending'
     },
     notes: ''
   });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);

     try {
       // Validate required fields
       if (!formData.orderNumber?.trim() || !formData.productName?.trim() || !formData.productId?.trim() || formData.amount <= 0) {
         toast({
           title: "Validation Error",
           description: "Please fill in all required fields with valid values.",
           variant: "destructive",
         });
         setLoading(false);
         return;
       }

       // Prepare order data with current date
       const orderData: any = {
         ...formData,
         dateOfDeparture: new Date().toISOString() // Use current date
       };

       // Add invoice file if selected
       if (invoiceFile) {
         orderData.invoice = invoiceFile;
       }

       const response = await orderAPI.createOrder(orderData);
      
      toast({
        title: "Order Created Successfully",
        description: `Order ${response.data.data.orderNumber} has been created.`,
        variant: "default",
      });

      router.push('/admin/orders');
    } catch (error: any) {
      console.error('Failed to create order:', error);
      
      toast({
        title: "Failed to Create Order",
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Create New Order</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add a new order to your system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Information
              </CardTitle>
              <CardDescription>
                Enter the product details for this order
              </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
               <div>
                 <Label htmlFor="orderNumber">Order ID *</Label>
                 <Input
                   id="orderNumber"
                   value={formData.orderNumber}
                   onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                   placeholder="Enter order ID (e.g., ORD001)"
                   required
                 />
               </div>
               
               <div>
                 <Label htmlFor="productName">Product Name *</Label>
                 <Input
                   id="productName"
                   value={formData.productName}
                   onChange={(e) => handleInputChange('productName', e.target.value)}
                   placeholder="Enter product name"
                   required
                 />
               </div>
               
               <div>
                 <Label htmlFor="productId">Product ID *</Label>
                 <Input
                   id="productId"
                   value={formData.productId}
                   onChange={(e) => handleInputChange('productId', e.target.value)}
                   placeholder="Enter product ID"
                   required
                 />
               </div>
               
               <div>
                 <Label htmlFor="amount">Amount (₹) *</Label>
                 <Input
                   id="amount"
                   type="number"
                   min="0"
                   step="any"
                   value={formData.amount === 0 ? '' : formData.amount}
                   onChange={(e) => {
                     const value = e.target.value;
                     // Clear field when user starts typing if it's currently 0
                     const numValue = value === '' ? 0 : Number(value);
                     handleInputChange('amount', numValue);
                   }}
                   onFocus={(e) => {
                     // Clear the field when focused if it's 0
                     if (formData.amount === 0) {
                       e.target.value = '';
                     }
                   }}
                   onBlur={(e) => {
                     // Set to 0 if field is empty on blur
                     if (e.target.value === '') {
                       handleInputChange('amount', 0);
                     }
                   }}
                   placeholder="Enter order amount"
                   required
                 />
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Configure payment details for this order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={formData.paymentInfo?.paymentMethod || 'cod'} 
                  onValueChange={(value) => handleInputChange('paymentInfo.paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select 
                  value={formData.paymentInfo?.paymentStatus || 'pending'} 
                  onValueChange={(value) => handleInputChange('paymentInfo.paymentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Additional Information
            </CardTitle>
            <CardDescription>
              Add any additional notes or information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="invoice">Invoice PDF (Optional)</Label>
              <Input
                id="invoice"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      toast({
                        title: "Invalid File Type",
                        description: "Please select a PDF file.",
                        variant: "destructive",
                      });
                      e.target.value = '';
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      toast({
                        title: "File Too Large",
                        description: "File size must be less than 10MB.",
                        variant: "destructive",
                      });
                      e.target.value = '';
                      return;
                    }
                    setInvoiceFile(file);
                  }
                }}
                className="cursor-pointer"
              />
              {invoiceFile && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selected: {invoiceFile.name} ({(invoiceFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                 <span className="font-medium">{formData.orderNumber || 'N/A'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-gray-400">Product:</span>
                 <span className="font-medium">{formData.productName || 'N/A'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                 <span className="font-medium">{formatPrice(formData.amount)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                 <span className="font-medium capitalize">{formData.paymentInfo?.paymentMethod || 'N/A'}</span>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
