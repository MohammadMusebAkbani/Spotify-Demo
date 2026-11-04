import { useQuery } from '@tanstack/react-query';
import { useMerchant } from '../config/MerchantProvider';
import { fetchProductByHandle } from '../services/shopify/api';
import { ProductDetail } from '../services/shopify/types';

export function useProduct(handle: string) {
  const { config } = useMerchant();

  return useQuery<ProductDetail | null, Error>({
    queryKey: ['product', config.id, handle],
    queryFn: () => fetchProductByHandle(handle),
    enabled: !!handle,
    staleTime: 1000 * 60 * 5,
  });
}

