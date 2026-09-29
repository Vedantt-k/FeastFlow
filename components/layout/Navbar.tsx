'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/hooks/useCart';
import {
  ShoppingBag, User, LogOut, ChefHat, LayoutDashboard,
  Menu, X, Search, Bell
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const userRole = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-stone-900">
              Feast<span className="text-brand-500">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/restaurants" className="btn-ghost text-sm">Restaurants</Link>
            {session && <Link href="/orders" className="btn-ghost text-sm">My Orders</Link>}
            {(userRole === 'restaurant_owner' || userRole === 'admin') && (
              <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/restaurants" className="hidden md:flex btn-ghost p-2.5 rounded-xl">
              <Search className="w-5 h-5" />
            </Link>

            {session && (
              <Link href="/cart" className="relative p-2.5 hover:bg-brand-50 rounded-xl transition-colors">
                <ShoppingBag className="w-5 h-5 text-stone-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-600 font-semibold text-sm">
                        {session.user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-stone-700">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-stone-100 py-2 animate-scale-in">
                    <div className="px-4 py-2 border-b border-stone-100 mb-1">
                      <p className="text-sm font-semibold text-stone-800">{session.user?.name}</p>
                      <p className="text-xs text-stone-400">{session.user?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors" onClick={() => setProfileOpen(false)}>
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors" onClick={() => setProfileOpen(false)}>
                      <ShoppingBag className="w-4 h-4" /> Orders
                    </Link>
                    {(userRole === 'restaurant_owner' || userRole === 'admin') && (
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                    )}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm hidden md:block">Sign in</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 hover:bg-stone-100 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-100 py-3 space-y-1 animate-slide-up">
            <Link href="/restaurants" className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl" onClick={() => setMenuOpen(false)}>Restaurants</Link>
            {session && <Link href="/orders" className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl" onClick={() => setMenuOpen(false)}>My Orders</Link>}
            {(userRole === 'restaurant_owner' || userRole === 'admin') && (
              <Link href="/dashboard" className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            {!session && (
              <Link href="/login" className="block px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl" onClick={() => setMenuOpen(false)}>Sign in</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
