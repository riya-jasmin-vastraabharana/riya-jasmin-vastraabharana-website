import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

/* interface CartState {
  items: CartItem[];
  addItem:        (product: Product) => void;
  removeItem:     (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart:      () => void;
} */

interface CartState {
  items: CartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
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
      name: 'rjv-cart-v2',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }    

  )
);