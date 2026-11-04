import { useQuery } from '@tanstack/react-query';
import { getReviewsAdapter, ReviewSummary } from '../adapters/reviews';
import { useMerchant } from '../config/MerchantProvider';

export function useReviews(productId: string) {
  const { config } = useMerchant();
  const reviewsFeature = config.features.reviews;
  const isEnabled = reviewsFeature === 'mock';

  return useQuery<ReviewSummary | null, Error>({
    queryKey: ['reviews', config.id, productId],
    queryFn: async () => {
      const adapter = getReviewsAdapter(reviewsFeature);
      if (!adapter) return null;
      return adapter.getReviews(productId);
    },
    enabled: isEnabled && !!productId,
    staleTime: 1000 * 60 * 10,
  });
}

