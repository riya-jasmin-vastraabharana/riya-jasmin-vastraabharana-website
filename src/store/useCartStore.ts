import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

// ── FIXED: removed broken JS getters (get total(){} / get itemCount(){})
// Zustand freezes getters at 0 in localStorage — they never update.
// total and itemCount are now computed in App.tsx directly from items[].

interface CartState {
  items: CartItem[];
  addItem:        (product: Product) => void;
  removeItem:     (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart:      () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const existing = get().items.find(i => i.product.id === product.id);
        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }));
        } else {
          set(state => ({
            items: [...state.items, { product, quantity: 1 }],
          }));
        }
      },

      removeItem: (productId) =>
        set(state => ({
          items: state.items.filter(i => i.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'rjv-cart-v2',   // ← changed name clears old broken localStorage cache
    }
  )
);