'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Package, Search, ArrowLeft, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderAPI } from '@/lib/api';
import { Order, OrderFilters } from '@/lib/types';
import { formatPrice, formatDate, getStatusBadgeColor, debounce } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filters, setFilters] = useState<OrderFilters>({});

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders({ ...filters, sellerId: 'admin_001' });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce((term: string) => {
    if (term.trim()) {
      orderAPI.searchOrders(term).then(response => {
        setOrders(response.data.data || []);
      }).catch(error => {
        console.error('Search failed:', error);
        toast({
          title: "Search Error",
          description: "Failed to search orders",
          variant: "destructive",
        });
      });
    } else {
      fetchOrders();
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilters({ ...filters, status: undefined });
    } else {
      setFilters({ ...filters, status: status as any });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !statusFilter || statusFilter === 'all' || order.status === statusFilter;
    return matchesStatus;
  });

  const orderStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading orders...</div>
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
            <h1 className="text-2xl font-bold text-black dark:text-white">Orders</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and track your orders
            </p>
          </div>
        </div>
        <Link href="/admin/orders/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg shadow border border-gray-300 dark:border-gray-500">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filters</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] shadow overflow-hidden sm:rounded-md border border-gray-300 dark:border-gray-500">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-black dark:text-white">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Orders will appear here when you create them.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-4">
                <Link href="/admin/orders/create">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Order
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-500">
            {filteredOrders.map((order) => (
              <li key={order._id}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-black dark:text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.productName} • {formatPrice(order.amount)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </div>
                        {order.receivedAmount > 0 && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Received: {formatPrice(order.receivedAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                      <Link href={`/admin/orders/${order._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {order.shippingInfo?.trackingNumber && (
                    <div className="mt-2 text-sm text-gray-500">
                      <strong>Tracking:</strong> {order.shippingInfo.trackingNumber}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
