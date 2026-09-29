import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (item) => {
        const { items, restaurantId } = get();

        // If cart has items from different restaurant, clear it
        if (restaurantId && restaurantId !== item.restaurantId) {
          set({
            items: [{ ...item, id: `${item.menuItemId}-${Date.now()}` }],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          });
          return;
        }

        const existing = items.find((i) => i.menuItemId === item.menuItemId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, id: `${item.menuItemId}-${Date.now()}` }],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          });
        }
      },

      removeItem: (menuItemId) => {
        const { items } = get();
        const updated = items.filter((i) => i.menuItemId !== menuItemId);
        set({
          items: updated,
          restaurantId: updated.length === 0 ? null : get().restaurantId,
          restaurantName: updated.length === 0 ? null : get().restaurantName,
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

      getItemQuantity: (menuItemId) => {
        return get().items.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
      },

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'food-cart' }
  )
);
