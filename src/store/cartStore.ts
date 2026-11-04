import { create } from 'zustand';
import {
  addLinesToCart,
  createCart,
  fetchCart,
  removeCartLines,
  updateCartLines,
} from '../services/shopify/api';
import { Cart } from '../services/shopify/types';
import { StorageService } from '../utils/storage';

const CART_ID_STORAGE_KEY = 'cart_id';

interface CartState {
  cartId: string | null;
  cart: Cart | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  selectedCollection: string | null;
  searchQuery: string;

  // Actions
  initializeCart: () => Promise<void>;
  addToCart: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refreshCart: () => Promise<Cart | null>;
  setSelectedCollection: (handle: string | null) => void;
  setSearchQuery: (query: string) => void;
  resetCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: null,
  cart: null,
  isLoading: true,
  isSyncing: false,
  error: null,
  selectedCollection: null,
  searchQuery: '',

  setSelectedCollection: (handle) => set({ selectedCollection: handle }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  initializeCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const storedCartId = await StorageService.getItem(CART_ID_STORAGE_KEY);
      if (storedCartId) {
        const existingCart = await fetchCart(storedCartId);
        if (existingCart && existingCart.id) {
          set({ cartId: existingCart.id, cart: existingCart, isLoading: false });
          return;
        }
      }

      // If no valid stored cart or expired, create a new one silently
      const newCart = await createCart([]);
      await StorageService.setItem(CART_ID_STORAGE_KEY, newCart.id);
      set({ cartId: newCart.id, cart: newCart, isLoading: false });
    } catch (err: unknown) {
      // In case creating fails offline, keep loading false with error
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to initialize cart',
      });
    }
  },

  addToCart: async (merchandiseId: string, quantity = 1) => {
    set({ isSyncing: true, error: null });
    try {
      let currentCartId = get().cartId;
      if (!currentCartId) {
        const newCart = await createCart([{ merchandiseId, quantity }]);
        await StorageService.setItem(CART_ID_STORAGE_KEY, newCart.id);
        set({ cartId: newCart.id, cart: newCart, isSyncing: false });
        return;
      }

      const updatedCart = await addLinesToCart(currentCartId, [{ merchandiseId, quantity }]);
      set({ cart: updatedCart, isSyncing: false });
    } catch (err: unknown) {
      set({
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Failed to add item to cart',
      });
      throw err;
    }
  },

  updateQuantity: async (lineId: string, quantity: number) => {
    const currentCartId = get().cartId;
    if (!currentCartId) return;

    set({ isSyncing: true, error: null });
    try {
      let updatedCart: Cart;
      if (quantity <= 0) {
        updatedCart = await removeCartLines(currentCartId, [lineId]);
      } else {
        updatedCart = await updateCartLines(currentCartId, [{ id: lineId, quantity }]);
      }
      set({ cart: updatedCart, isSyncing: false });
    } catch (err: unknown) {
      set({
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Failed to update quantity',
      });
      throw err;
    }
  },

  removeLine: async (lineId: string) => {
    const currentCartId = get().cartId;
    if (!currentCartId) return;

    set({ isSyncing: true, error: null });
    try {
      const updatedCart = await removeCartLines(currentCartId, [lineId]);
      set({ cart: updatedCart, isSyncing: false });
    } catch (err: unknown) {
      set({
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Failed to remove item',
      });
      throw err;
    }
  },

  refreshCart: async () => {
    const currentCartId = get().cartId;
    if (!currentCartId) return null;

    set({ isSyncing: true });
    try {
      const freshCart = await fetchCart(currentCartId);
      if (freshCart) {
        set({ cart: freshCart, isSyncing: false });
        return freshCart;
      } else {
        // Silently recreate
        const newCart = await createCart([]);
        await StorageService.setItem(CART_ID_STORAGE_KEY, newCart.id);
        set({ cartId: newCart.id, cart: newCart, isSyncing: false });
        return newCart;
      }
    } catch (err) {
      set({ isSyncing: false });
      return null;
    }
  },

  resetCart: async () => {
    try {
      const newCart = await createCart([]);
      await StorageService.setItem(CART_ID_STORAGE_KEY, newCart.id);
      set({ cartId: newCart.id, cart: newCart });
    } catch (err) {
      // ignore
    }
  },
}));

