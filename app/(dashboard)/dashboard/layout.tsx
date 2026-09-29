'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  Users, BarChart3, Settings, ChefHat, LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/dashboard/restaurants', label: 'Restaurants', icon: ChefHat },
  { href: '/dashboard/customers', label: 'Customers', icon: Users, adminOnly: true },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && userRole === 'customer') {
      router.push('/restaurants');
    }
  }, [status, userRole, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = NAV_ITEMS.filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-100 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-stone-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-stone-900">
              Feast<span className="text-brand-500">Flow</span>
            </span>
          </Link>
          <div className="mt-4 px-3 py-2 bg-brand-50 rounded-xl">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
              {userRole === 'admin' ? 'Admin Panel' : 'Restaurant Dashboard'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-brand-600 font-semibold text-sm">
                {session?.user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{session?.user?.name}</p>
              <p className="text-xs text-stone-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
