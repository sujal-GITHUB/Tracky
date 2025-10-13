'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';
import { OrderStats } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, recentOrdersResponse] = await Promise.all([
          api.get('/orders/admin/stats'),
          api.get('/orders/admin/recent?limit=5')
        ]);

        setStats(statsResponse.data.data);
        setRecentOrders(recentOrdersResponse.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
      name: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
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
      name: 'Completed Orders',
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome to the admin panel. Here's an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                recentOrders.map((order: any) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-[#FFDEDE] dark:bg-[#1a1a1a] flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-[#ff0000] dark:text-gray-500" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          Order #{order.id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {order.user?.name || order.user?.email} • {formatPrice(order.total)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
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
