import { Review, ReviewsAdapter, ReviewSummary } from './ReviewsAdapter';

const SAMPLE_REVIEWS: Omit<Review, 'id' | 'date'>[] = [
  {
    author: 'Sarah M.',
    rating: 5,
    title: 'Outstanding quality and fit!',
    content: 'Exceeded all my expectations. The material feels premium and durable, and the styling is top notch.',
    verifiedPurchase: true,
  },
  {
    author: 'David L.',
    rating: 4,
    title: 'Very pleased with purchase',
    content: 'Great design and very comfortable for everyday wear. Shipping was remarkably fast.',
    verifiedPurchase: true,
  },
  {
    author: 'Elena R.',
    rating: 5,
    title: 'Worth every penny',
    content: 'The attention to detail is noticeable right away. Have received multiple compliments already.',
    verifiedPurchase: true,
  },
  {
    author: 'Marcus K.',
    rating: 4,
    title: 'Solid build, true to size',
    content: 'Fit matches the size chart accurately. Good craftsmanship and colors match the photos.',
    verifiedPurchase: false,
  },
];

export class MockReviewsProvider implements ReviewsAdapter {
  async getReviews(productId: string): Promise<ReviewSummary> {
    // Deterministic pseudo-random seed based on product ID string
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = (hash << 5) - hash + productId.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    const count = 2 + (positiveHash % 3); // 2, 3, or 4 reviews
    const selected = SAMPLE_REVIEWS.slice(0, count).map((r, idx) => ({
      ...r,
      id: `rev-${positiveHash}-${idx}`,
      date: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString().split('T')[0],
    }));

    const totalStars = selected.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = selected.length > 0 ? parseFloat((totalStars / selected.length).toFixed(1)) : 5.0;

    return {
      averageRating,
      totalCount: selected.length,
      reviews: selected,
    };
  }
}

