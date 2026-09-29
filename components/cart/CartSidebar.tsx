'use client';

import { useCartStore } from '@/hooks/useCart';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartSidebarProps {
  restaurantId?: string;
}

export default function CartSidebar({ restaurantId }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCartStore();
  const sub = subtotal();
  const deliveryFee = 40;
  const tax = Math.round(sub * 0.05);
  const total = sub + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-100 p-6 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-7 h-7 text-stone-400" />
        </div>
        <p className="font-semibold text-stone-600 mb-1">Your cart is empty</p>
        <p className="text-sm text-stone-400">Add items from the menu to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
      <div className="p-5 border-b border-stone-100">
        <h3 className="font-display font-bold text-lg text-stone-900 flex items-center justify-between">
          Your Cart
          <span className="text-sm font-semibold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-full">
            {totalItems()} items
          </span>
        </h3>
        {useCartStore.getState().restaurantName && (
          <p className="text-xs text-stone-400 mt-1">{useCartStore.getState().restaurantName}</p>
        )}
      </div>

      {/* Items */}
      <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
              <Image src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&q=80'} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-stone-500">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-3 h-3 text-stone-600" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-stone-800">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                className="w-6 h-6 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="px-5 pb-5 space-y-2 border-t border-stone-100 pt-4">
        <div className="flex justify-between text-sm text-stone-500">
          <span>Subtotal</span>
          <span>{formatCurrency(sub)}</span>
        </div>
        <div className="flex justify-between text-sm text-stone-500">
          <span>Delivery fee</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-sm text-stone-500">
          <span>GST (5%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100">
          <span>Total</span>
          <span className="text-brand-600">{formatCurrency(total)}</span>
        </div>

        <Link
          href="/checkout"
          className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] mt-2"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
