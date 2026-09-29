'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle, Clock, Package, Truck, MapPin,
  Phone, ArrowLeft, XCircle, Star, Navigation
} from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusColor } from '@/lib/utils';
import axios from 'axios';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    // Poll every 30s for live updates
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-8 max-w-3xl space-y-4">
          <div className="skeleton h-48 rounded-3xl" />
          <div className="skeleton h-32 rounded-3xl" />
          <div className="skeleton h-48 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIdx = order.status === 'cancelled'
    ? -1
    : STATUS_ORDER.indexOf(order.status);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-8 max-w-3xl">
        {/* Back */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-stone-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-stone-400">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`ml-auto badge ${getOrderStatusColor(order.status)}`}>
            {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </span>
        </div>

        {/* Tracking */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-3xl border border-stone-100 p-6 mb-4">
            <h2 className="font-semibold text-stone-900 mb-6">Order Tracking</h2>
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-100">
                <div
                  className="h-full bg-brand-400 transition-all duration-700"
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIdx;
                  const active = idx === currentStepIdx;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 w-16">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        done
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-400'
                      } ${active ? 'ring-4 ring-brand-100' : ''}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className={`text-center text-xs font-medium leading-tight ${done ? 'text-stone-700' : 'text-stone-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {order.estimatedDelivery && order.status !== 'delivered' && (
              <div className="mt-5 flex items-center gap-2 text-sm text-stone-500 bg-stone-50 rounded-xl p-3">
                <Clock className="w-4 h-4 text-brand-500" />
                Estimated delivery: <span className="font-semibold text-stone-700">{formatDate(order.estimatedDelivery)}</span>
              </div>
            )}
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-5 mb-4 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Order Cancelled</p>
              <p className="text-sm text-red-500 mt-0.5">Your order has been cancelled</p>
            </div>
          </div>
        )}

        {/* Restaurant info */}
        <div className="bg-white rounded-3xl border border-stone-100 p-5 mb-4 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
            <Image
              src={order.restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'}
              alt={order.restaurant?.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-900">{order.restaurant?.name}</p>
            <p className="text-sm text-stone-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {order.restaurant?.address?.city}
            </p>
          </div>
          {order.restaurant?.phone && (
            <a href={`tel:${order.restaurant.phone}`} className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center hover:bg-brand-100 transition-colors">
              <Phone className="w-4 h-4 text-brand-500" />
            </a>
          )}
        </div>

        {/* Order items */}
        <div className="bg-white rounded-3xl border border-stone-100 p-5 mb-4">
          <h2 className="font-semibold text-stone-900 mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{item.name}</p>
                    <p className="text-xs text-stone-400">× {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-stone-800 text-sm">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>Delivery fee</span><span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>GST</span><span>{formatCurrency(order.tax)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-3xl border border-stone-100 p-5 mb-4">
          <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" /> Delivery Address
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            {order.deliveryAddress.street}, {order.deliveryAddress.city},<br />
            {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Track Order button - show when order is active */}
          {['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
            <Link
              href={`/orders/${id}/tracking`}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            >
              <Navigation className="w-5 h-5" />
              Track Order on Map
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </span>
            </Link>
          )}

          <div className="flex gap-3">
            {order.status === 'delivered' && (
              <Link href={`/restaurant/${order.restaurant?._id}`} className="flex-1 btn-primary text-center py-3">
                <span className="flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" /> Reorder
                </span>
              </Link>
            )}
            {order.status === 'delivered' && (
              <Link href={`/orders/${id}/tracking`} className="flex-1 btn-secondary text-center py-3 flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" /> View Map
              </Link>
            )}
            {['pending', 'confirmed'].includes(order.status) && (
              <button
                onClick={async () => {
                  await axios.patch(`/api/orders/${id}`, { status: 'cancelled' });
                  setOrder({ ...order, status: 'cancelled' });
                }}
                className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-2xl transition-colors"
              >
                Cancel Order
              </button>
            )}
            <Link href="/restaurants" className="flex-1 btn-secondary text-center py-3">
              Order Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
