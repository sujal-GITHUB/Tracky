'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  XCircle
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { OrderStats, Order } from '@/lib/types';
import { formatPrice, formatDate, getStatusBadgeColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, recentOrdersResponse] = await Promise.all([
          orderAPI.getOrderStatistics(),
          orderAPI.getRecentOrders(5)
        ]);

        setStats(statsResponse.data.data);
        setRecentOrders(recentOrdersResponse.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      name: 'Received Revenue',
      value: formatPrice(stats?.totalReceivedAmount || 0),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Delivered Orders',
      value: stats?.deliveredOrders || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Cancelled Orders',
      value: stats?.cancelledOrders || 0,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Tracky Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome to your order management dashboard. Track and manage your orders efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-[#1a1a1a] overflow-hidden shadow rounded-lg border border-gray-300 dark:border-gray-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-black dark:text-white">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg border border-gray-300 dark:border-gray-500">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-black dark:text-white mb-4">
            Order Status Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { status: 'pending', count: stats?.pendingOrders || 0 },
              { status: 'delivered', count: stats?.deliveredOrders || 0 },
              { status: 'cancelled', count: stats?.cancelledOrders || 0 },
            ].map(({ status, count }) => (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status as any)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <div className="mt-1 text-lg font-semibold text-black dark:text-white">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg border border-gray-300 dark:border-gray-500">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-black dark:text-white mb-4">
            Recent Orders
          </h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-500">
              {recentOrders.length === 0 ? (
                <li className="py-5">
                  <div className="text-center text-gray-500 dark:text-gray-400">No recent orders</div>
                </li>
              ) : (
                recentOrders.map((order) => (
                  <li key={order._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-[#FFDEDE] dark:bg-[#1a1a1a] flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-[#ff0000] dark:text-gray-500" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {order.productName} • {formatPrice(order.amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
