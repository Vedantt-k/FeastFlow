'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';

const CUISINES = ['All', 'Indian', 'Chinese', 'Italian', 'Pizza', 'Burgers', 'Sushi', 'Mexican', 'Thai', 'Mediterranean', 'Healthy', 'Desserts'];

function RestaurantSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-100">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-2/3 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function RestaurantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (cuisine && cuisine !== 'All') params.cuisine = cuisine;

      const { data } = await axios.get('/api/restaurants', { params });
      setRestaurants(data.restaurants);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, cuisine, page]);

  useEffect(() => {
    const debounce = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(debounce);
  }, [fetchRestaurants]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900 mb-1">Restaurants</h1>
          <p className="text-stone-500">{pagination.total} restaurants available</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search restaurants or cuisines..."
              className="input-field pl-12 py-3.5"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cuisine Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => { setCuisine(c); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                cuisine === c
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <RestaurantSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="font-display text-xl font-bold text-stone-700 mb-2">No restaurants found</h3>
            <p className="text-stone-400">Try a different search or cuisine filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {restaurants.map((r: any) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                  page === i + 1
                    ? 'bg-brand-500 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-brand-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
