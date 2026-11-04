import { OrdersAdapter, OrderRecord } from './OrdersAdapter';
import { StorageService } from '../../utils/storage';

const ORDERS_KEY = 'orders';

export class LocalOrdersAdapter implements OrdersAdapter {
  async getOrders(): Promise<OrderRecord[]> {
    const orders = await StorageService.getJSON<OrderRecord[]>(ORDERS_KEY);
    return orders ?? [];
  }

  async saveOrder(order: OrderRecord): Promise<void> {
    const currentOrders = await this.getOrders();
    // Prepend newer orders
    const updated = [order, ...currentOrders.filter((o) => o.id !== order.id)];
    await StorageService.setJSON(ORDERS_KEY, updated);
  }

  async getOrderById(id: string): Promise<OrderRecord | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id) ?? null;
  }
}

