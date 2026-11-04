import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersAdapter, OrderRecord } from '../adapters/orders';
import { useMerchant } from '../config/MerchantProvider';

export function useOrders() {
  const { config } = useMerchant();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery<OrderRecord[], Error>({
    queryKey: ['orders', config.id],
    queryFn: () => ordersAdapter.getOrders(),
    staleTime: 1000 * 30, // 30 seconds
  });

  const saveOrderMutation = useMutation({
    mutationFn: (newOrder: OrderRecord) => ordersAdapter.saveOrder(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', config.id] });
    },
  });

  return {
    ...ordersQuery,
    orders: ordersQuery.data ?? [],
    saveOrder: saveOrderMutation.mutateAsync,
  };
}

