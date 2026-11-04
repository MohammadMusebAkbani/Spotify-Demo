export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verifiedPurchase?: boolean;
}

export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
  reviews: Review[];
}

export interface ReviewsAdapter {
  getReviews(productId: string): Promise<ReviewSummary>;
}

