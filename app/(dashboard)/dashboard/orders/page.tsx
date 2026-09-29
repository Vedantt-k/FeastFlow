'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate, getOrderStatusColor } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Clock, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      const { data } = await axios.get('/api/orders', { params });
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await axios.patch(`/api/orders/${orderId}`, { status });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-400 text-sm mt-0.5">Manage and update order status</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 btn-secondary py-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === t.value
                ? 'bg-brand-500 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-brand-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Order</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Items</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Total</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order._id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-stone-800 text-sm">#{order.orderNumber}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-stone-700">{order.user?.name}</p>
                      <p className="text-xs text-stone-400">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-stone-600 max-w-[180px] truncate">
                        {order.items.map((i: any) => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-stone-800 text-sm">{formatCurrency(order.total)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${getOrderStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-stone-400">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      {!['delivered', 'cancelled'].includes(order.status) && (
                        <select
                          value={order.status}
                          disabled={updating === order._id}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
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
