import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, Truck, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: any;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant._id}`} className="group block">
      <div className="card overflow-hidden border border-stone-100 group-hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 bg-stone-100 overflow-hidden">
          <Image
            src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'}
            alt={restaurant.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Open/Closed badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-stone-700 text-stone-200'
          }`}>
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </div>
          {/* Delivery time */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            {restaurant.deliveryTime} min
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-stone-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {restaurant.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-stone-700">{restaurant.rating.toFixed(1)}</span>
            </div>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-400">({restaurant.reviewCount.toLocaleString()} reviews)</span>
          </div>

          {/* Cuisine tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.cuisine?.slice(0, 3).map((c: string) => (
              <span key={c} className="badge bg-stone-100 text-stone-600 text-xs">{c}</span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-50">
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <Truck className="w-3.5 h-3.5" />
              <span>{formatCurrency(restaurant.deliveryFee)} delivery</span>
            </div>
            <div className="text-xs text-stone-400">
              Min. {formatCurrency(restaurant.minOrder)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
