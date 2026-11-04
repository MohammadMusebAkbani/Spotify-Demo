import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { ordersAdapter, OrderRecord } from '../adapters/orders';
import { Cart, CartLine } from '../services/shopify/types';
import { useCartStore } from '../store/cartStore';

export interface CheckoutValidationResult {
  hasChanges: boolean;
  unavailableLines: CartLine[];
  priceChanged: boolean;
  oldTotal?: string;
  newTotal?: string;
}

export function useCart() {
  const store = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const lines = store.cart?.lines?.nodes ?? [];
  const totalQuantity = store.cart?.totalQuantity ?? 0;
  const totalCost = store.cart?.cost?.totalAmount;

  /**
   * Validates cart before checkout:
   * Re-fetches the cart, detects price changes, and detects sold out / unavailable items.
   */
  const validateCartBeforeCheckout = useCallback(async (): Promise<{
    freshCart: Cart | null;
    validation: CheckoutValidationResult;
  }> => {
    const oldCart = store.cart;
    const oldTotal = oldCart?.cost?.totalAmount?.amount;

    const freshCart = await store.refreshCart();
    if (!freshCart) {
      return {
        freshCart: null,
        validation: {
          hasChanges: false,
          unavailableLines: [],
          priceChanged: false,
        },
      };
    }

    const freshLines = freshCart.lines?.nodes ?? [];
    const unavailableLines = freshLines.filter(
      (line) => !line.merchandise || !line.merchandise.availableForSale
    );

    const newTotal = freshCart.cost?.totalAmount?.amount;
    const priceChanged = !!(oldTotal && newTotal && oldTotal !== newTotal);

    const hasChanges = unavailableLines.length > 0 || priceChanged;

    return {
      freshCart,
      validation: {
        hasChanges,
        unavailableLines,
        priceChanged,
        oldTotal,
        newTotal,
      },
    };
  }, [store]);

  /**
   * Executes checkout:
   * 1. Saves local order record for demo orders.
   * 2. Opens checkout URL via expo-web-browser.
   */
  const proceedToCheckoutUrl = useCallback(
    async (cartToCheckout: Cart): Promise<void> => {
      setIsCheckingOut(true);
      try {
        // Create order snapshot for Orders screen
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const orderRecord: OrderRecord = {
          id: orderId,
          date: new Date().toISOString(),
          total: cartToCheckout.cost.totalAmount,
          status: 'Checkout started (mock)',
          checkoutUrl: cartToCheckout.checkoutUrl,
          lines: (cartToCheckout.lines?.nodes ?? []).map((line) => ({
            title: line.merchandise.product?.title || line.merchandise.title,
            variantTitle: line.merchandise.title,
            quantity: line.quantity,
            price: line.cost.totalAmount,
            imageUrl: line.merchandise.image?.url,
          })),
        };

        await ordersAdapter.saveOrder(orderRecord);

        if (cartToCheckout.checkoutUrl) {
          await WebBrowser.openBrowserAsync(cartToCheckout.checkoutUrl);
        }
      } finally {
        setIsCheckingOut(false);
      }
    },
    []
  );

  return {
    cart: store.cart,
    cartId: store.cartId,
    lines,
    totalQuantity,
    totalCost,
    isLoading: store.isLoading,
    isSyncing: store.isSyncing,
    error: store.error,
    isCheckingOut,
    initializeCart: store.initializeCart,
    addToCart: store.addToCart,
    updateQuantity: store.updateQuantity,
    removeLine: store.removeLine,
    refreshCart: store.refreshCart,
    resetCart: store.resetCart,
    validateCartBeforeCheckout,
    proceedToCheckoutUrl,
  };
}

