import { OrdersAdapter } from './OrdersAdapter';
import { LocalOrdersAdapter } from './localOrdersAdapter';

export * from './OrdersAdapter';
export * from './localOrdersAdapter';

// Factory function: currently returns LocalOrdersAdapter.
// In a production store with Shopify Customer Account API,
// this factory can instantiate a CustomerAccountOrdersAdapter based on merchantConfig.
export function createOrdersAdapter(): OrdersAdapter {
  return new LocalOrdersAdapter();
}

export const ordersAdapter = createOrdersAdapter();

