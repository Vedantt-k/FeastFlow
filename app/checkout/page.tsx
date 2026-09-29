'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useCartStore } from '@/hooks/useCart';
import { MapPin, CreditCard, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'online', label: 'Pay Online (UPI / Card)', icon: '💳' },
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, restaurantId, subtotal, clearCart } = useCartStore();
  const sub = subtotal();
  const deliveryFee = 40;
  const tax = Math.round(sub * 0.05);
  const total = sub + deliveryFee + tax;

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.pincode) {
      toast.error('Please fill in the delivery address');
      return;
    }
    if (!session) {
      router.push('/login?callbackUrl=/checkout');
      return;
    }

    setPlacing(true);
    try {
      const { data } = await axios.post('/api/orders', {
        restaurantId,
        items: items.map((i) => ({
          menuItem: i.menuItemId,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        deliveryAddress: address,
        paymentMethod,
        notes,
      });

      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="page-container py-20 text-center">
          <p className="text-stone-500">No items in cart. <Link href="/restaurants" className="text-brand-500 font-semibold">Browse restaurants</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-stone-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: delivery + payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery address */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-500" />
                </div>
                <h2 className="font-semibold text-stone-900">Delivery Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="123, Street name, Area"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Mumbai"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    placeholder="400001"
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="font-semibold text-stone-900">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === pm.value
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-stone-100 hover:border-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="accent-brand-500"
                    />
                    <span className="text-2xl">{pm.icon}</span>
                    <span className="font-medium text-stone-800">{pm.label}</span>
                    {paymentMethod === pm.value && (
                      <CheckCircle className="w-5 h-5 text-brand-500 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Special Instructions (optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., No onions, extra spicy, ring bell..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Right: summary */}
          <div className="bg-white rounded-3xl border border-stone-100 p-6 h-fit sticky top-24">
            <h3 className="font-display font-bold text-lg text-stone-900 mb-4">Order Summary</h3>

            <div className="space-y-2.5 mb-5">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between text-sm">
                  <span className="text-stone-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-stone-800">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2.5 mb-6">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span><span>{formatCurrency(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Delivery fee</span><span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>GST (5%)</span><span>{formatCurrency(tax)}</span>
              </div>
              <div className="h-px bg-stone-100" />
              <div className="flex justify-between font-bold text-stone-900">
                <span>Total</span>
                <span className="text-brand-600 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full btn-primary py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Place Order · {formatCurrency(total)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
