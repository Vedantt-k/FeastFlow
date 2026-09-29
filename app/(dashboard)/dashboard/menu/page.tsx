'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

function MenuModal({ item, restaurantId, onClose, onSave }: any) {
  const [form, setForm] = useState(item || {
    name: '', description: '', price: '', category: '', image: '',
    isVeg: false, isAvailable: true, calories: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), calories: Number(form.calories) || undefined, restaurant: restaurantId };
      if (item?._id) {
        const { data } = await axios.put(`/api/menu/${item._id}`, payload);
        onSave(data.item, 'edit');
      } else {
        const { data } = await axios.post('/api/menu', payload);
        onSave(data.item, 'add');
      }
      toast.success(item ? 'Item updated!' : 'Item added!');
      onClose();
    } catch {
      toast.error('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <h2 className="font-display text-xl font-bold text-stone-900 mb-5">
          {item ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required placeholder="e.g. Butter Chicken" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={2} placeholder="Brief description..." />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" required min="0" placeholder="299" />
            </div>
            <div>
              <label className="label">Calories</label>
              <input type="number" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} className="input-field" placeholder="350" />
            </div>
            <div className="col-span-2">
              <label className="label">Category</label>
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" required placeholder="e.g. Starters, Main Course, Desserts" />
            </div>
            <div className="col-span-2">
              <label className="label">Image URL</label>
              <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="input-field" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setForm({...form, isVeg: !form.isVeg})} className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${form.isVeg ? 'bg-green-500' : 'bg-stone-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isVeg ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-stone-600">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setForm({...form, isAvailable: !form.isAvailable})} className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${form.isAvailable ? 'bg-brand-500' : 'bg-stone-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-stone-600">Available</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-60">
              {saving ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardMenuPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<any>(null); // null | 'add' | {item}
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const { data } = await axios.get('/api/restaurants');
        const userId = (session?.user as any)?.id;
        const myRestaurant = data.restaurants.find((r: any) => r.owner?._id === userId || r.owner === userId);
        if (myRestaurant) {
          setRestaurantId(myRestaurant._id);
          const { data: menuData } = await axios.get(`/api/menu?restaurantId=${myRestaurant._id}`);
          setItems(menuData.items);
          setCategories(['All', ...menuData.categories]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchRestaurant();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await axios.delete(`/api/menu/${id}`);
      setItems(items.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSave = (savedItem: any, type: 'add' | 'edit') => {
    if (type === 'add') setItems([...items, savedItem]);
    else setItems(items.map(i => i._id === savedItem._id ? savedItem : i));
  };

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || i.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 lg:p-8">
      {modal && (
        <MenuModal
          item={modal === 'add' ? null : modal}
          restaurantId={restaurantId}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Menu</h1>
          <p className="text-stone-400 text-sm mt-0.5">{items.length} items</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2 py-2.5">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat ? 'bg-brand-500 text-white' : 'bg-white border border-stone-200 text-stone-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-stone-400">No items found. <button onClick={() => setModal('add')} className="text-brand-500 font-semibold">Add one?</button></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: any) => (
            <div key={item._id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-card transition-shadow">
              <div className="relative h-36 bg-stone-100">
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.isVeg ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                  {!item.isAvailable && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-700 text-white">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-stone-900 line-clamp-1">{item.name}</h4>
                    <span className="text-xs text-stone-400">{item.category}</span>
                  </div>
                  <span className="font-bold text-brand-600 flex-shrink-0">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-xs text-stone-400 mt-2 line-clamp-2">{item.description}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setModal(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
