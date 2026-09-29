'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import MenuItemCard from '@/components/menu/MenuItemCard';
import CartSidebar from '@/components/cart/CartSidebar';
import { Star, Clock, Truck, MapPin, Phone, Heart, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<{ grouped: Record<string, any[]>; categories: string[] }>({ grouped: {}, categories: [] });
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, mRes] = await Promise.all([
          axios.get(`/api/restaurants/${id}`),
          axios.get(`/api/menu?restaurantId=${id}`),
        ]);
        setRestaurant(rRes.data.restaurant);
        setMenu(mRes.data);
        setActiveCategory(mRes.data.categories[0] || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="h-64 skeleton rounded-none" />
        <div className="page-container py-8 grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Cover */}
      <div className="relative h-64 md:h-80 bg-stone-200 overflow-hidden">
        <Image
          src={restaurant.coverImage || restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="page-container">
            <div className="flex items-end justify-between">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-stone-600 text-white'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? 'bg-white animate-pulse' : 'bg-stone-300'}`} />
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">{restaurant.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  {restaurant.cuisine?.map((c: string) => (
                    <span key={c} className="text-stone-300 text-sm">{c}</span>
                  ))}
                </div>
              </div>
              <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Heart className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-5 bg-white rounded-2xl border border-stone-100 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <div>
              <p className="font-bold text-stone-900">{restaurant.rating.toFixed(1)}</p>
              <p className="text-xs text-stone-400">{restaurant.reviewCount} reviews</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p className="font-bold text-stone-900">{restaurant.deliveryTime} min</p>
              <p className="text-xs text-stone-400">Delivery time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-stone-900">{formatCurrency(restaurant.deliveryFee)}</p>
              <p className="text-xs text-stone-400">Delivery fee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm line-clamp-1">{restaurant.address?.city}</p>
              <p className="text-xs text-stone-400">Location</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Menu */}
          <div className="flex-1 min-w-0">
            {/* Veg toggle */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Menu</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium text-stone-600">Veg only</span>
                <div
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${vegOnly ? 'bg-green-500' : 'bg-stone-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${vegOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>

            {/* Category nav */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {menu.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:border-brand-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu items */}
            <div className="space-y-10">
              {menu.categories.map((cat) => {
                const items = menu.grouped[cat]?.filter((item: any) => !vegOnly || item.isVeg) || [];
                if (items.length === 0) return null;
                return (
                  <div key={cat} id={`cat-${cat}`}>
                    <h3 className="font-display text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                      {cat}
                      <span className="text-sm font-normal text-stone-400">({items.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {items.map((item: any) => (
                        <MenuItemCard
                          key={item._id}
                          item={item}
                          restaurantId={restaurant._id}
                          restaurantName={restaurant.name}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart sidebar - desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <CartSidebar restaurantId={restaurant._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
