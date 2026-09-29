import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ChevronRight, Star, Clock, Truck, Shield } from 'lucide-react';

const CATEGORIES = [
  { name: 'Pizza', emoji: '🍕', color: 'bg-red-50 text-red-600' },
  { name: 'Burgers', emoji: '🍔', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Sushi', emoji: '🍱', color: 'bg-green-50 text-green-600' },
  { name: 'Indian', emoji: '🍛', color: 'bg-orange-50 text-orange-600' },
  { name: 'Chinese', emoji: '🥡', color: 'bg-rose-50 text-rose-600' },
  { name: 'Desserts', emoji: '🍰', color: 'bg-pink-50 text-pink-600' },
  { name: 'Healthy', emoji: '🥗', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Coffee', emoji: '☕', color: 'bg-amber-50 text-amber-600' },
];

const FEATURES = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Hot food delivered in 30 minutes or less', color: 'text-brand-500' },
  { icon: Star, title: 'Top Rated', desc: 'Discover the best-reviewed restaurants', color: 'text-yellow-500' },
  { icon: Shield, title: 'Safe & Fresh', desc: 'Quality checked & hygiene certified', color: 'text-green-500' },
  { icon: Clock, title: 'Track Orders', desc: 'Real-time order tracking at your fingertips', color: 'text-purple-500' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-orange-700">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="page-container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Delivering to 50+ cities
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Delicious food,<br />
              <span className="text-brand-200">at your door</span>
            </h1>
            <p className="text-brand-100 text-lg mb-10 leading-relaxed max-w-xl">
              Order from hundreds of top-rated restaurants. Fast delivery, real-time tracking, and the best food in town.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/restaurants"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 font-bold px-8 py-4 rounded-2xl hover:bg-brand-50 transition-all duration-200 hover:shadow-lg active:scale-95 text-base"
              >
                Order Now <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register?role=restaurant_owner"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200 text-base backdrop-blur-sm"
              >
                List Your Restaurant
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10">
              <div className="text-white">
                <span className="block font-display text-3xl font-bold">500+</span>
                <span className="text-brand-200 text-sm">Restaurants</span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-white">
                <span className="block font-display text-3xl font-bold">50k+</span>
                <span className="text-brand-200 text-sm">Happy Customers</span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-white">
                <span className="block font-display text-3xl font-bold">4.8★</span>
                <span className="text-brand-200 text-sm">Avg Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Browse by Cuisine</h2>
          <Link href="/restaurants" className="text-brand-500 hover:text-brand-600 font-semibold text-sm flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/restaurants?cuisine=${cat.name}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:shadow-card-hover transition-all duration-200 active:scale-95 group border border-stone-100"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
              <span className="text-xs font-semibold text-stone-600 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-stone-100">
        <div className="page-container py-16">
          <h2 className="section-title text-center mb-12">Why choose FeastFlow?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-16">
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-10 text-8xl">🍕</div>
            <div className="absolute top-8 right-20 text-6xl">🍔</div>
            <div className="absolute bottom-4 left-32 text-7xl">🍜</div>
            <div className="absolute bottom-8 right-10 text-8xl">🍣</div>
          </div>
          <div className="relative">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Ready to eat something amazing?
            </h2>
            <p className="text-stone-400 mb-8 text-lg">
              Join thousands of happy customers ordering every day.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-95 text-base">
              Start Ordering <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8">
        <div className="page-container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-400">© 2025 FeastFlow. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-stone-400">
            <Link href="#" className="hover:text-stone-600">Privacy</Link>
            <Link href="#" className="hover:text-stone-600">Terms</Link>
            <Link href="#" className="hover:text-stone-600">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
