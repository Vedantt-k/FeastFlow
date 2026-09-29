'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ShoppingBag, TrendingUp, Users, UtensilsCrossed,
  Package, Truck, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#f97316', '#22c55e', '#a855f7', '#eab308', '#ef4444'];

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500 mb-1">{title}</p>
          <p className="font-display text-2xl font-bold text-stone-900">{value}</p>
          {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/dashboard');
        setStats(data.stats);
        setTopItems(data.topItems);

        // Format chart data
        const formatted = data.monthlyRevenue.map((m: any) => ({
          name: MONTHS[m._id.month - 1],
          revenue: m.revenue,
          orders: m.orders,
        }));
        setChartData(formatted);

        // Pie chart data
        const sb = data.statusBreakdown;
        setPieData([
          { name: 'Delivered', value: sb.delivered || 0 },
          { name: 'On Delivery', value: sb.out_for_delivery || 0 },
          { name: 'Preparing', value: sb.preparing || 0 },
          { name: 'Pending', value: sb.pending || 0 },
          { name: 'Cancelled', value: sb.cancelled || 0 },
        ].filter(d => d.value > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userRole = (session?.user as any)?.role;

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-72 rounded-2xl lg:col-span-2" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-stone-900">
          Good morning, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-stone-400 mt-1">Here's what's happening in your {userRole === 'admin' ? 'platform' : 'restaurant'}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString() || '0'}
          subtitle={`+${stats?.recentOrders || 0} this month`}
          icon={ShoppingBag}
          color="bg-brand-50 text-brand-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="All time"
          icon={TrendingUp}
          color="bg-green-50 text-green-500"
        />
        <StatCard
          title="On Delivery"
          value={stats?.onDelivery || 0}
          subtitle="Active deliveries"
          icon={Truck}
          color="bg-purple-50 text-purple-500"
        />
        <StatCard
          title="Delivered"
          value={stats?.delivered || 0}
          subtitle="Completed orders"
          icon={CheckCircle}
          color="bg-blue-50 text-blue-500"
        />
        {userRole === 'admin' && (
          <>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers?.toLocaleString() || '0'}
              icon={Users}
              color="bg-yellow-50 text-yellow-500"
            />
            <StatCard
              title="Restaurants"
              value={stats?.totalRestaurants || '0'}
              icon={UtensilsCrossed}
              color="bg-pink-50 text-pink-500"
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-stone-900">Revenue Overview</h2>
              <p className="text-xs text-stone-400">Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [formatCurrency(v), 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h2 className="font-semibold text-stone-900 mb-1">Order Status</h2>
          <p className="text-xs text-stone-400 mb-4">All time breakdown</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 12, color: '#78716c' }}>{v}</span>}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-stone-400 text-sm">
              No order data yet
            </div>
          )}
        </div>
      </div>

      {/* Top items */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <h2 className="font-semibold text-stone-900 mb-4">Top Selling Items</h2>
        {topItems.length === 0 ? (
          <p className="text-stone-400 text-sm py-4 text-center">No data yet</p>
        ) : (
          <div className="space-y-3">
            {topItems.map((item: any, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-6 h-6 flex-shrink-0 bg-stone-100 rounded-lg text-xs font-bold text-stone-500 flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm truncate">{item._id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full"
                        style={{ width: `${(item.totalOrdered / topItems[0].totalOrdered) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0">{item.totalOrdered} orders</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-700 flex-shrink-0">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
