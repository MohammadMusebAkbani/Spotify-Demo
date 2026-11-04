import { MoneyV2 } from '../../services/shopify/types';

export interface OrderLineSnapshot {
  title: string;
  variantTitle?: string;
  quantity: number;
  price: MoneyV2;
  imageUrl?: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  lines: OrderLineSnapshot[];
  total: MoneyV2;
  status: string;
  checkoutUrl?: string;
}

export interface OrdersAdapter {
  getOrders(): Promise<OrderRecord[]>;
  saveOrder(order: OrderRecord): Promise<void>;
  getOrderById(id: string): Promise<OrderRecord | null>;
}

