'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import OrderTrackingMap from '@/components/map/OrderTrackingMap';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Clock, CheckCircle, Package,
  Truck, MapPin, Phone, RefreshCw, Navigation,
  ChefHat, Home, Star
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

const STATUS_STEPS = [
  { key: 'pending',           label: 'Order Placed',    icon: Package,    desc: 'Your order has been received' },
  { key: 'confirmed',         label: 'Confirmed',        icon: CheckCircle, desc: 'Restaurant accepted your order' },
  { key: 'preparing',         label: 'Preparing',        icon: ChefHat,    desc: 'Chef is cooking your food' },
  { key: 'out_for_delivery',  label: 'Out for Delivery', icon: Truck,      desc: 'Rider is on the way' },
  { key: 'delivered',         label: 'Delivered',        icon: Home,       desc: 'Enjoy your meal!' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

function getETA(estimatedDelivery?: string): string {
  if (!estimatedDelivery) return 'Calculating...';
  const diff = new Date(estimatedDelivery).getTime() - Date.now();
  if (diff <= 0) return 'Any moment now';
  const mins = Math.ceil(diff / 60000);
  if (mins > 60) return `~${Math.ceil(mins / 60)}h ${mins % 60}m`;
  return `~${mins} min`;
}

function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(date));
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = useCallback(async () => {
    try {
      const [orderRes, trackingRes] = await Promise.all([
        axios.get(`/api/orders/${id}`),
        axios.get(`/api/orders/${id}/tracking`),
      ]);
      setOrder(orderRes.data.order);
      setTracking(trackingRes.data.tracking);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Auto-refresh every 30 seconds for live updates
  useEffect(() => {
    const isActive = order && !['delivered', 'cancelled'].includes(order.status);
    if (!isActive) return;
    const interval = setInterval(() => fetchTracking(), 30000);
    return () => clearInterval(interval);
  }, [order, fetchTracking]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTracking();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="page-container py-6 max-w-5xl">
          <div className="skeleton h-10 w-48 rounded-xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 skeleton h-[420px] rounded-3xl" />
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-36 rounded-3xl" />
              <div className="skeleton h-64 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order || !tracking) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-20 text-center">
          <p className="text-stone-400">Tracking data not available.</p>
          <Link href="/orders" className="btn-primary mt-4 inline-flex">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = order.status === 'cancelled'
    ? -1
    : STATUS_ORDER.indexOf(order.status);

  const isActive = !['delivered', 'cancelled'].includes(order.status);
  const showMap = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="page-container py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/orders" className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm bg-white border border-stone-100">
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-stone-900">
                Track Order
              </h1>
              <p className="text-sm text-stone-400">#{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isActive && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live · updated {formatTime(lastUpdated)}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white hover:bg-stone-50 rounded-xl shadow-sm border border-stone-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-stone-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Map */}
          <div className="lg:col-span-3 space-y-4">

            {/* Map card */}
            {showMap ? (
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-card">
                {/* Map header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center">
                      <Navigation className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">Live Delivery Map</p>
                      <p className="text-xs text-stone-400">
                        {order.status === 'out_for_delivery'
                          ? 'Rider is heading your way'
                          : order.status === 'delivered'
                          ? 'Order delivered!'
                          : 'Waiting for rider pickup'}
                      </p>
                    </div>
                  </div>
                  {isActive && order.status !== 'delivered' && (
                    <div className="text-right">
                      <p className="text-xs text-stone-400">ETA</p>
                      <p className="font-bold text-brand-600 text-sm">{getETA(order.estimatedDelivery)}</p>
                    </div>
                  )}
                </div>

                {/* Map */}
                <div className="h-[380px] relative">
                  <OrderTrackingMap tracking={tracking} />

                  {/* Map legend */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-card border border-stone-100 z-[1000]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-base">🍽️</span>
                        <span className="text-stone-600 font-medium">{tracking.restaurant.name}</span>
                      </div>
                      {tracking.rider && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-base">🛵</span>
                          <span className="text-stone-600 font-medium">Your Rider</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-base">🏠</span>
                        <span className="text-stone-600 font-medium">Your Location</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Placeholder when order is just pending */
              <div className="bg-white rounded-3xl border border-stone-100 p-10 text-center shadow-card">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-9 h-9 text-brand-400" />
                </div>
                <h3 className="font-semibold text-stone-700 mb-1">Waiting for Confirmation</h3>
                <p className="text-sm text-stone-400">
                  The map will appear once the restaurant confirms your order.
                </p>
              </div>
            )}

            {/* Delivery addresses row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">From</span>
                </div>
                <p className="font-semibold text-stone-800 text-sm">{tracking.restaurant.name}</p>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                  {tracking.restaurant.address?.street}, {tracking.restaurant.address?.city}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🏠</span>
                  </div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">To</span>
                </div>
                <p className="font-semibold text-stone-800 text-sm">Your Address</p>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                  {tracking.delivery.address?.street}, {tracking.delivery.address?.city}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Status + Order details */}
          <div className="lg:col-span-2 space-y-4">

            {/* ETA Banner */}
            {isActive && order.status !== 'pending' && (
              <div className="bg-gradient-to-br from-brand-500 to-orange-600 rounded-3xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-brand-100 text-sm">Estimated arrival</p>
                  <Clock className="w-4 h-4 text-brand-200" />
                </div>
                <p className="font-display text-4xl font-bold">{getETA(order.estimatedDelivery)}</p>
                <p className="text-brand-100 text-xs mt-1">
                  {order.estimatedDelivery
                    ? `By ${formatTime(order.estimatedDelivery)}`
                    : 'Being calculated'}
                </p>
              </div>
            )}

            {order.status === 'delivered' && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5 text-white">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-10 h-10 text-white" />
                  <div>
                    <p className="font-bold text-lg">Order Delivered! 🎉</p>
                    <p className="text-green-100 text-sm">
                      {order.deliveredAt ? `At ${formatTime(order.deliveredAt)}` : 'Enjoy your meal!'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status stepper */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-card">
              <h2 className="font-semibold text-stone-900 mb-4 text-sm">Order Status</h2>
              <div className="space-y-1">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIdx;
                  const active = idx === currentStepIdx;
                  const isLast = idx === STATUS_STEPS.length - 1;

                  return (
                    <div key={step.key} className="flex gap-3">
                      {/* Icon + line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          done
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-400'
                        } ${active ? 'ring-4 ring-brand-100 scale-110' : ''}`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-6 mt-1 rounded-full transition-colors duration-500 ${
                            idx < currentStepIdx ? 'bg-brand-400' : 'bg-stone-100'
                          }`} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="pb-4">
                        <p className={`text-sm font-semibold transition-colors ${done ? 'text-stone-900' : 'text-stone-400'}`}>
                          {step.label}
                          {active && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
                              Now
                            </span>
                          )}
                        </p>
                        <p className={`text-xs mt-0.5 ${done ? 'text-stone-400' : 'text-stone-300'}`}>
                          {step.desc}
                        </p>
                        {/* Timestamp from history */}
                        {done && order.statusHistory?.find((h: any) => h.status === step.key) && (
                          <p className="text-xs text-stone-300 mt-0.5">
                            {formatTime(order.statusHistory.find((h: any) => h.status === step.key).timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Restaurant contact */}
            <div className="bg-white rounded-3xl border border-stone-100 p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  <Image
                    src={order.restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'}
                    alt={order.restaurant?.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm truncate">{order.restaurant?.name}</p>
                  <p className="text-xs text-stone-400">{order.restaurant?.address?.city}</p>
                </div>
                {order.restaurant?.phone && (
                  <a
                    href={`tel:${order.restaurant.phone}`}
                    className="w-9 h-9 bg-brand-50 hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Phone className="w-4 h-4 text-brand-500" />
                  </a>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-card">
              <h2 className="font-semibold text-stone-900 mb-3 text-sm">Order Summary</h2>
              <div className="space-y-2 mb-3">
                {order.items?.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-stone-600 truncate flex-1 mr-2">
                      {item.name} <span className="text-stone-400">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-stone-700 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-xs text-stone-400">+{order.items.length - 3} more items</p>
                )}
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between">
                <span className="font-bold text-stone-800 text-sm">Total</span>
                <span className="font-bold text-brand-600">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {order.status === 'delivered' && (
                <Link
                  href={`/restaurant/${order.restaurant?._id}`}
                  className="flex-1 btn-primary py-3 text-sm text-center flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" /> Reorder
                </Link>
              )}
              {['pending', 'confirmed'].includes(order.status) && (
                <button
                  onClick={async () => {
                    await axios.patch(`/api/orders/${id}`, { status: 'cancelled' });
                    setOrder({ ...order, status: 'cancelled' });
                  }}
                  className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-2xl transition-colors text-sm"
                >
                  Cancel
                </button>
              )}
              <Link href="/orders" className="flex-1 btn-secondary py-3 text-sm text-center">
                All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
