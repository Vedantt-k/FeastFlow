'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import {
  User, Mail, Phone, MapPin, Plus, Trash2,
  Save, Camera, ShoppingBag, ChevronRight, Star
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user) {
      setForm({
        name: session.user.name || '',
        phone: (session.user as any).phone || '',
      });
      setAddresses((session.user as any).addresses || []);
    }
  }, [session, status, router]);

  useEffect(() => {
    if (activeTab === 'orders' && session) {
      setOrdersLoading(true);
      axios.get('/api/orders?limit=10')
        .then(res => setOrders(res.data.orders))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, session]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await axios.patch('/api/profile', form);
      await update({ name: form.name });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill in all required address fields');
      return;
    }
    const updated = [...addresses, { ...newAddress, id: Date.now().toString() }];
    setAddresses(updated);
    setNewAddress({ label: 'Home', street: '', city: '', state: '', pincode: '', isDefault: false });
    setShowAddressForm(false);
    toast.success('Address added!');
  };

  const handleRemoveAddress = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
    toast.success('Address removed');
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-orange-100 text-orange-700',
      out_for_delivery: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-stone-100 text-stone-600';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-8 max-w-3xl space-y-4">
          <div className="skeleton h-40 rounded-3xl" />
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-8 max-w-3xl">

        {/* Profile header card */}
        <div className="bg-gradient-to-br from-brand-500 to-orange-600 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={80}
                  height={80}
                  className="rounded-2xl border-4 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white/30 bg-white/20 flex items-center justify-center shadow-lg">
                  <span className="font-display text-3xl font-bold text-white">
                    {session?.user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Info */}
            <div>
              <h1 className="font-display text-2xl font-bold">{session?.user?.name}</h1>
              <p className="text-brand-100 text-sm mt-0.5">{session?.user?.email}</p>
              <span className="inline-block mt-2 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full capitalize">
                {((session?.user as any)?.role || 'customer').replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-stone-100 rounded-2xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-stone-100 p-6 animate-fade-in">
            <h2 className="font-semibold text-stone-900 mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field pl-11"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    className="input-field pl-11 opacity-60 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-stone-400 mt-1 ml-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field pl-11"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="label">Account Type</label>
                <div className="input-field bg-stone-50 cursor-not-allowed opacity-70 capitalize">
                  {((session?.user as any)?.role || 'customer').replace('_', ' ')}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary flex items-center gap-2 py-3 px-6 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="animate-fade-in space-y-4">
            {addresses.length === 0 && !showAddressForm && (
              <div className="bg-white rounded-3xl border border-stone-100 p-10 text-center">
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-7 h-7 text-brand-400" />
                </div>
                <p className="font-semibold text-stone-700 mb-1">No saved addresses</p>
                <p className="text-sm text-stone-400 mb-5">Add an address for faster checkout</p>
              </div>
            )}

            {addresses.map((addr, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-stone-800">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAddress(idx)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Address Form */}
            {showAddressForm && (
              <div className="bg-white rounded-3xl border border-stone-100 p-6 animate-slide-up">
                <h3 className="font-semibold text-stone-900 mb-4">New Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Label</label>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, label: l })}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            newAddress.label === l
                              ? 'bg-brand-500 text-white border-brand-500'
                              : 'border-stone-200 text-stone-600 hover:border-brand-300'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Street Address *</label>
                    <input
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="input-field"
                      placeholder="123, Street name, Area"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">City *</label>
                      <input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="input-field"
                        placeholder="Bangalore"
                      />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="input-field"
                        placeholder="Karnataka"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="input-field"
                      placeholder="560001"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="accent-brand-500 w-4 h-4"
                    />
                    <span className="text-sm text-stone-600 font-medium">Set as default address</span>
                  </label>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 btn-secondary py-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddAddress}
                      className="flex-1 btn-primary py-3"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-500 hover:border-brand-300 hover:text-brand-500 transition-all duration-200 font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-100 p-10 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-7 h-7 text-stone-400" />
                </div>
                <p className="font-semibold text-stone-700 mb-1">No orders yet</p>
                <p className="text-sm text-stone-400 mb-5">Your order history will appear here</p>
                <Link href="/restaurants" className="btn-primary inline-flex">
                  Browse Restaurants
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <Link key={order._id} href={`/orders/${order._id}`}>
                    <div className="bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-card p-4 transition-all duration-200 group">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-stone-800 text-sm group-hover:text-brand-600 transition-colors">
                              {order.restaurant?.name}
                            </p>
                            <span className={`badge text-xs ${getStatusColor(order.status)}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 truncate">
                            {order.items?.map((i: any) => i.name).join(', ')}
                          </p>
                          <p className="text-xs text-stone-400 mt-1">#{order.orderNumber}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-stone-800 text-sm">
                            ₹{order.total?.toLocaleString()}
                          </p>
                          <ChevronRight className="w-4 h-4 text-stone-300 ml-auto mt-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="text-center pt-2">
                  <Link href="/orders" className="text-brand-500 hover:text-brand-600 text-sm font-semibold">
                    View all orders →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
