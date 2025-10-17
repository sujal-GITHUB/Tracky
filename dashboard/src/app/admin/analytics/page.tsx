'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyticsAPI } from '@/lib/api';
import { MonthlyAnalytics, YearlyAnalytics } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [yearlyAnalytics, setYearlyAnalytics] = useState<YearlyAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedMonth]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      if (selectedMonth === 'all') {
        // Fetch yearly analytics
        const response = await analyticsAPI.getYearlyAnalytics(selectedYear);
        setYearlyAnalytics(response.data.data);
        setMonthlyData(response.data.data.monthlyData || []);
      } else {
        // Fetch specific month analytics
        const response = await analyticsAPI.getMonthlyAnalytics(selectedYear, selectedMonth as number);
        setMonthlyData([response.data.data]);
        setYearlyAnalytics(null);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setLoading(true);
      
      if (selectedMonth === 'all') {
        // Recalculate all for the year
        await analyticsAPI.recalculateAll();
        toast({
          title: "Success",
          description: "All analytics recalculated successfully.",
        });
      } else {
        // Recalculate specific month
        await analyticsAPI.recalculateMonth(selectedYear, selectedMonth as number);
        toast({
          title: "Success",
          description: `Analytics for ${MONTHS[(selectedMonth as number) - 1]} ${selectedYear} recalculated successfully.`,
        });
      }
      
      fetchAnalytics();
    } catch (error) {
      console.error('Failed to recalculate analytics:', error);
      toast({
        title: "Error",
        description: "Failed to recalculate analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats based on selected view
  const stats = selectedMonth === 'all' && yearlyAnalytics ? {
    totalOrders: yearlyAnalytics.totalOrders,
    totalRevenue: yearlyAnalytics.totalRevenue,
    totalReceivedAmount: yearlyAnalytics.totalReceivedAmount,
    pendingOrders: yearlyAnalytics.pendingOrders,
    deliveredOrders: yearlyAnalytics.deliveredOrders,
    cancelledOrders: yearlyAnalytics.cancelledOrders,
    averageOrderValue: yearlyAnalytics.averageOrderValue,
    completionRate: yearlyAnalytics.completionRate,
    cancellationRate: yearlyAnalytics.cancellationRate,
  } : monthlyData[0] || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  // Prepare data for charts
  const statusData = [
    { name: 'Pending', value: stats?.pendingOrders || 0, color: '#F59E0B' },
    { name: 'Delivered', value: stats?.deliveredOrders || 0, color: '#10B981' },
    { name: 'Cancelled', value: stats?.cancelledOrders || 0, color: '#EF4444' },
  ];

  const revenueData = selectedMonth === 'all' && monthlyData.length > 0
    ? monthlyData.map(m => ({
        name: MONTHS[m.month - 1].substring(0, 3),
        revenue: m.totalRevenue,
        received: m.totalReceivedAmount,
        orders: m.totalOrders
      }))
    : [{ name: 'Revenue', amount: stats?.totalReceivedAmount || 0 }];

  const completionRate = stats?.completionRate || (stats?.totalOrders ? 
    ((stats.deliveredOrders || 0) / stats.totalOrders * 100) : 0);

  const cancellationRate = stats?.cancellationRate || (stats?.totalOrders ? 
    ((stats.cancelledOrders || 0) / stats.totalOrders * 100) : 0);

  // Generate year options (last 5 years + current year + next year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your order performance and business metrics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(val === 'all' ? 'all' : parseInt(val))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx} value={(idx + 1).toString()}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleRecalculate} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats?.totalReceivedAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue from confirmed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.deliveredOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Delivered orders count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats?.averageOrderValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Average order value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Cancellation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of orders by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedMonth === 'all' ? 'Monthly Revenue Trend' : 'Revenue Breakdown'}</CardTitle>
            <CardDescription>
              {selectedMonth === 'all' ? 'Revenue across all months' : 'Confirmed revenue breakdown'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {selectedMonth === 'all' && monthlyData.length > 0 ? (
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPrice(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Total Revenue" strokeWidth={2} />
                  <Line type="monotone" dataKey="received" stroke="#82ca9d" name="Received Amount" strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPrice(Number(value))} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Status Counts */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Counts</CardTitle>
            <CardDescription>
              Detailed breakdown by status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusData.map((status) => (
              <div key={status.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium">{status.name}</span>
                </div>
                <span className="text-sm font-bold">{status.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <div className="flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-bold text-green-600">{completionRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cancellation Rate</span>
              <div className="flex items-center">
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm font-bold text-red-600">{cancellationRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Orders</span>
              <span className="text-sm font-bold">{stats?.totalOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Orders</span>
              <span className="text-sm font-bold">{stats?.pendingOrders || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>
              Revenue and payment status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confirmed Revenue</span>
              <span className="text-sm font-bold">{formatPrice(stats?.totalReceivedAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Received Amount</span>
              <span className="text-sm font-bold text-green-600">
                {formatPrice(stats?.totalReceivedAmount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Collection Rate</span>
              <span className="text-sm font-bold">
                {stats?.totalRevenue ? 
                  ((stats.totalReceivedAmount / stats.totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
