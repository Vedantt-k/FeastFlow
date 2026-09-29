'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard').then(res => {
      setData(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    );
  }

  const chartData = data?.monthlyRevenue?.map((m: any) => ({
    name: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders,
  })) || [];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-900">Analytics</h1>
        <p className="text-stone-400 text-sm mt-0.5">Revenue and order insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(data?.stats?.totalRevenue || 0), color: 'text-green-600' },
          { label: 'Total Orders', value: data?.stats?.totalOrders || 0, color: 'text-brand-600' },
          { label: 'Delivered', value: data?.stats?.delivered || 0, color: 'text-blue-600' },
          { label: 'Cancelled', value: data?.stats?.cancelled || 0, color: 'text-red-500' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs text-stone-400 mb-1">{card.label}</p>
            <p className={`font-display text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue bar chart */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-5">
        <h2 className="font-semibold text-stone-900 mb-1">Monthly Revenue</h2>
        <p className="text-xs text-stone-400 mb-5">Last 6 months</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: any) => [formatCurrency(v), 'Revenue']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }}
            />
            <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders line chart */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-5">
        <h2 className="font-semibold text-stone-900 mb-1">Order Volume</h2>
        <p className="text-xs text-stone-400 mb-5">Number of orders per month</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
            <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top items */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <h2 className="font-semibold text-stone-900 mb-4">Top Performing Items</h2>
        {(data?.topItems || []).length === 0 ? (
          <p className="text-stone-400 text-sm py-4 text-center">No data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left text-xs font-semibold text-stone-400 uppercase pb-3 pr-4">#</th>
                  <th className="text-left text-xs font-semibold text-stone-400 uppercase pb-3">Item</th>
                  <th className="text-right text-xs font-semibold text-stone-400 uppercase pb-3">Orders</th>
                  <th className="text-right text-xs font-semibold text-stone-400 uppercase pb-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topItems.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-stone-50 last:border-0">
                    <td className="py-3 pr-4 text-sm text-stone-400">{idx + 1}</td>
                    <td className="py-3 text-sm font-medium text-stone-800">{item._id}</td>
                    <td className="py-3 text-right text-sm text-stone-600">{item.totalOrdered}</td>
                    <td className="py-3 text-right text-sm font-semibold text-stone-800">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
