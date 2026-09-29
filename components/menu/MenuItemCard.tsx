'use client';

import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';

interface MenuItemCardProps {
  item: any;
  restaurantId: string;
  restaurantName: string;
}

export default function MenuItemCard({ item, restaurantId, restaurantName }: MenuItemCardProps) {
  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(item._id);

  const handleAdd = () => {
    addItem({
      menuItemId: item._id,
      restaurantId,
      restaurantName,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
      isVeg: item.isVeg,
    });
  };

  return (
    <div className="flex gap-4 bg-white rounded-2xl p-4 border border-stone-100 hover:border-stone-200 hover:shadow-card transition-all duration-200">
      {/* Veg indicator */}
      <div className="flex-shrink-0 pt-0.5">
        <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-stone-900 mb-1">{item.name}</h4>
        <p className="text-sm text-stone-400 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
        <p className="font-bold text-stone-900">{formatCurrency(item.price)}</p>
        {item.calories && (
          <p className="text-xs text-stone-400 mt-0.5">{item.calories} cal</p>
        )}
      </div>

      {/* Image + add button */}
      <div className="flex-shrink-0 relative">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100">
          <Image
            src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80'}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Add/Quantity button */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!item.isAvailable}
              className="flex items-center gap-1 bg-white border-2 border-brand-500 text-brand-600 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-brand-500 hover:text-white transition-all duration-150 active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-brand-500 text-white text-sm font-bold px-2 py-1.5 rounded-xl shadow-sm">
              <button
                onClick={() => updateQuantity(item._id, quantity - 1)}
                className="hover:scale-110 transition-transform"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 text-center">{quantity}</span>
              <button
                onClick={handleAdd}
                className="hover:scale-110 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
