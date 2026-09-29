'use client';

import { useCartStore } from '@/hooks/useCart';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, restaurantName } = useCartStore();
  const sub = subtotal();
  const deliveryFee = items.length > 0 ? 40 : 0;
  const tax = Math.round(sub * 0.05);
  const total = sub + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-20 text-center">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">Your cart is empty</h2>
          <p className="text-stone-400 mb-8">Explore our restaurants and add items to your cart</p>
          <Link href="/restaurants" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/restaurants" className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-900">Your Cart</h1>
            {restaurantName && <p className="text-sm text-stone-400">{restaurantName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <h4 className="font-semibold text-stone-900 line-clamp-1">{item.name}</h4>
                  </div>
                  <p className="font-bold text-brand-600">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-stone-600" />
                  </button>
                  <span className="w-6 text-center font-bold text-stone-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.menuItemId)}
                    className="text-red-400 hover:text-red-500 transition-colors mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-red-400 hover:text-red-500 font-medium flex items-center gap-1.5 mt-2"
            >
              <Trash2 className="w-4 h-4" /> Clear cart
            </button>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-3xl border border-stone-100 p-6 h-fit">
            <h3 className="font-display font-bold text-lg text-stone-900 mb-5">Order Summary</h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-stone-500 text-sm">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatCurrency(sub)}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-sm">
                <span>Delivery fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-sm">
                <span>GST (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="h-px bg-stone-100" />
              <div className="flex justify-between font-bold text-stone-900">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
