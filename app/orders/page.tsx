'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Package, ChevronRight, ShoppingBag, Navigation } from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusColor } from '@/lib/utils';
import axios from 'axios';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <div className="flex gap-4">
        <div className="skeleton w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-1/3 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (activeStatus !== 'all') params.status = activeStatus;
        const { data } = await axios.get('/api/orders', { params });
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetch();
  }, [session, activeStatus]);

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Active' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-6">My Orders</h1>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveStatus(t.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeStatus === t.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-brand-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-9 h-9 text-stone-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-stone-700 mb-2">No orders yet</h3>
            <p className="text-stone-400 mb-6">Your order history will appear here</p>
            <Link href="/restaurants" className="btn-primary inline-flex">Browse Restaurants</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-card transition-all duration-200">
                <Link href={`/orders/${order._id}`} className="block p-5 group">
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image
                        src={order.restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=80'}
                        alt={order.restaurant?.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-stone-900 group-hover:text-brand-600 transition-colors">
                            {order.restaurant?.name}
                          </h4>
                          <p className="text-xs text-stone-400 mt-0.5">#{order.orderNumber}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-sm text-stone-500 mt-1 line-clamp-1">
                        {order.items.map((i: any) => i.name).join(', ')}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`badge text-xs ${getOrderStatusColor(order.status)}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-xs font-semibold text-stone-700 ml-auto">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Live track button for active orders */}
                {['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
                  <div className="px-5 pb-4">
                    <Link
                      href={`/orders/${order._id}/tracking`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Navigation className="w-4 h-4" />
                      Track Order on Map
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
