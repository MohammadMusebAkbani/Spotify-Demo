import { useQuery } from '@tanstack/react-query';
import { useMerchant } from '../config/MerchantProvider';
import { fetchCollectionProducts, fetchProducts } from '../services/shopify/api';
import { ProductListItem } from '../services/shopify/types';

export function useProducts(collectionHandle?: string | null, searchQuery?: string) {
  const { config } = useMerchant();

  return useQuery<ProductListItem[], Error>({
    queryKey: ['products', config.id, collectionHandle ?? 'all', searchQuery ?? ''],
    queryFn: async () => {
      if (collectionHandle && collectionHandle !== 'all') {
        return fetchCollectionProducts(collectionHandle);
      }
      return fetchProducts(24, searchQuery);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

