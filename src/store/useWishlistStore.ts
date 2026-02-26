import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.find(i => i.id === product.id);
        if (exists) {
          set(state => ({ items: state.items.filter(i => i.id !== product.id) }));
        } else {
          set(state => ({ items: [...state.items, product] }));
        }
      },

      has: (id) => get().items.some(i => i.id === id),
    }),
    { name: 'rjv-wishlist' }
  )
);
