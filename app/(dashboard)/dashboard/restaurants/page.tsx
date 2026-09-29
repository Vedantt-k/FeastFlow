'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Plus, Pencil, Star, Clock, Truck, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

const DEFAULT_HOURS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => ({
  day, open: '09:00', close: '22:00', isClosed: false,
}));

function RestaurantModal({ restaurant, onClose, onSave }: any) {
  const { data: session } = useSession();
  const [form, setForm] = useState(restaurant || {
    name: '', description: '', image: '', coverImage: '',
    cuisine: '', phone: '', email: '',
    address: { street: '', city: '', state: '', pincode: '' },
    deliveryTime: 30, deliveryFee: 40, minOrder: 100,
    openingHours: DEFAULT_HOURS,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        cuisine: typeof form.cuisine === 'string' ? form.cuisine.split(',').map((c: string) => c.trim()) : form.cuisine,
      };
      if (restaurant?._id) {
        const { data } = await axios.put(`/api/restaurants/${restaurant._id}`, payload);
        onSave(data.restaurant, 'edit');
      } else {
        const { data } = await axios.post('/api/restaurants', payload);
        onSave(data.restaurant, 'add');
      }
      toast.success(restaurant ? 'Restaurant updated!' : 'Restaurant created!');
      onClose();
    } catch {
      toast.error('Failed to save restaurant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <h2 className="font-display text-xl font-bold text-stone-900 mb-5">
          {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Restaurant Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required placeholder="e.g. The Spice Garden" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={2} placeholder="About your restaurant..." />
            </div>
            <div>
              <label className="label">Cuisine Types</label>
              <input value={typeof form.cuisine === 'string' ? form.cuisine : form.cuisine?.join(', ')} onChange={e => setForm({...form, cuisine: e.target.value})} className="input-field" placeholder="Indian, Chinese, Italian" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="+91 9876543210" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Cover Image URL</label>
              <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="input-field" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Street Address</label>
              <input value={form.address.street} onChange={e => setForm({...form, address: {...form.address, street: e.target.value}})} className="input-field" required />
            </div>
            <div>
              <label className="label">City</label>
              <input value={form.address.city} onChange={e => setForm({...form, address: {...form.address, city: e.target.value}})} className="input-field" required />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input value={form.address.pincode} onChange={e => setForm({...form, address: {...form.address, pincode: e.target.value}})} className="input-field" required />
            </div>
            <div>
              <label className="label">Delivery Time (min)</label>
              <input type="number" value={form.deliveryTime} onChange={e => setForm({...form, deliveryTime: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="label">Delivery Fee (₹)</label>
              <input type="number" value={form.deliveryFee} onChange={e => setForm({...form, deliveryFee: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="label">Min Order (₹)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm({...form, minOrder: Number(e.target.value)})} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-60">
              {saving ? 'Saving...' : restaurant ? 'Update' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardRestaurantsPage() {
  const { data: session } = useSession();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axios.get('/api/restaurants');
        const userId = (session?.user as any)?.id;
        const userRole = (session?.user as any)?.role;
        const filtered = userRole === 'admin'
          ? data.restaurants
          : data.restaurants.filter((r: any) => r.owner?._id === userId || r.owner === userId);
        setRestaurants(filtered);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchRestaurants();
  }, [session]);

  const toggleOpen = async (r: any) => {
    try {
      await axios.put(`/api/restaurants/${r._id}`, { isOpen: !r.isOpen });
      setRestaurants(restaurants.map(res => res._id === r._id ? { ...res, isOpen: !res.isOpen } : res));
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleSave = (saved: any, type: 'add' | 'edit') => {
    if (type === 'add') setRestaurants([...restaurants, saved]);
    else setRestaurants(restaurants.map(r => r._id === saved._id ? saved : r));
  };

  return (
    <div className="p-6 lg:p-8">
      {modal && <RestaurantModal restaurant={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Restaurants</h1>
          <p className="text-stone-400 text-sm mt-0.5">{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2 py-2.5">
          <Plus className="w-4 h-4" /> Add Restaurant
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-stone-400 mb-4">No restaurants yet.</p>
          <button onClick={() => setModal('add')} className="btn-primary">Add Your First Restaurant</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {restaurants.map((r: any) => (
            <div key={r._id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="relative h-36 bg-stone-100">
                <Image
                  src={r.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'}
                  alt={r.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => toggleOpen(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${r.isOpen ? 'bg-green-500 text-white' : 'bg-stone-700 text-white'}`}
                  >
                    {r.isOpen ? '● Open' : '● Closed'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-stone-900">{r.name}</h3>
                    <p className="text-xs text-stone-400">{r.cuisine?.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{r.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-stone-400 mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.deliveryTime}min</span>
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />{formatCurrency(r.deliveryFee)}</span>
                  <span>{r.address?.city}</span>
                </div>
                <button
                  onClick={() => setModal(r)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Restaurant
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
