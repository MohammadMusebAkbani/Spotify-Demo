import { ReviewsAdapter } from './ReviewsAdapter';
import { MockReviewsProvider } from './mockProvider';

export * from './ReviewsAdapter';
export * from './mockProvider';

export function getReviewsAdapter(feature: 'mock' | 'off'): ReviewsAdapter | null {
  if (feature === 'mock') {
    return new MockReviewsProvider();
  }
  return null;
}

