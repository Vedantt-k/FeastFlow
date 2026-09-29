'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { User, Bell, Shield, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardSettingsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState({
    newOrders: true,
    statusUpdates: true,
    promotions: false,
  });

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-400 text-sm mt-0.5">Manage your preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-brand-500" />
          </div>
          <h2 className="font-semibold text-stone-900">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-2xl font-bold text-brand-600">
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-stone-900">{session?.user?.name}</p>
            <p className="text-sm text-stone-400">{session?.user?.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold bg-brand-50 text-brand-600 px-2.5 py-0.5 rounded-full capitalize">
              {(session?.user as any)?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input defaultValue={session?.user?.name || ''} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input defaultValue={session?.user?.email || ''} className="input-field" disabled />
          </div>
        </div>
        <button
          onClick={() => toast.success('Profile saved!')}
          className="btn-primary mt-4 py-2.5 px-6 text-sm"
        >
          Save Changes
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="font-semibold text-stone-900">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'newOrders', label: 'New Orders', desc: 'Get notified when you receive a new order' },
            { key: 'statusUpdates', label: 'Status Updates', desc: 'Get notified on order status changes' },
            { key: 'promotions', label: 'Promotions', desc: 'Receive promotional emails and offers' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-800 text-sm">{item.label}</p>
                <p className="text-xs text-stone-400">{item.desc}</p>
              </div>
              <div
                onClick={() => setNotifications({...notifications, [item.key]: !(notifications as any)[item.key]})}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${(notifications as any)[item.key] ? 'bg-brand-500' : 'bg-stone-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${(notifications as any)[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-500" />
          </div>
          <h2 className="font-semibold text-stone-900">Security</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
          <button
            onClick={() => toast.success('Password updated!')}
            className="btn-primary py-2.5 px-6 text-sm"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
