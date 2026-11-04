import { useQuery } from '@tanstack/react-query';
import { useMerchant } from '../config/MerchantProvider';
import { fetchCollections } from '../services/shopify/api';
import { ShopifyCollection } from '../services/shopify/types';

export function useCollections() {
  const { config } = useMerchant();

  return useQuery<ShopifyCollection[], Error>({
    queryKey: ['collections', config.id],
    queryFn: () => fetchCollections(10),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

