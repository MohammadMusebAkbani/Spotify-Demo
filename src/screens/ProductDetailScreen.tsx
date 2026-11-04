import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ErrorState, Skeleton, VariantPicker } from '../components';
import { useMerchant } from '../config/MerchantProvider';
import { useCart, useProduct, useReviews } from '../hooks';
import { ProductVariant } from '../services/shopify/types';
import { formatMoney } from '../utils/format';

type RouteParams = {
  ProductDetail: {
    handle: string;
    title?: string;
  };
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const { theme, config } = useMerchant();
  const route = useRoute<RouteProp<RouteParams, 'ProductDetail'>>();
  const navigation = useNavigation<any>();

  const { handle } = route.params;
  const { data: product, isLoading, error, refetch } = useProduct(handle);
  const { addToCart, isSyncing } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Set initial variant when product loads
  useEffect(() => {
    if (product?.variants?.nodes && product.variants.nodes.length > 0) {
      // Pick first available variant, or first variant if none available
      const firstAvailable =
        product.variants.nodes.find((v) => v.availableForSale) || product.variants.nodes[0];
      setSelectedVariant(firstAvailable);
    }
  }, [product]);

  // Hook for reviews (disabled if feature is 'off')
  const { data: reviewSummary, isLoading: isLoadingReviews } = useReviews(product?.id ?? '');

  const images = product?.images?.nodes ?? [];
  const isAvailable = selectedVariant ? selectedVariant.availableForSale : product?.availableForSale;

  const currentPrice = selectedVariant?.price || product?.priceRange?.minVariantPrice;
  const formattedPrice = formatMoney(currentPrice?.amount, currentPrice?.currencyCode);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await addToCart(selectedVariant.id, 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err: unknown) {
      Alert.alert('Cart Error', err instanceof Error ? err.message : 'Unable to add item to cart');
    }
  };

  if (isLoading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <Skeleton width="100%" height={SCREEN_WIDTH * 0.95} borderRadius={0} />
        <View style={styles.body}>
          <Skeleton width="80%" height={26} borderRadius={6} style={{ marginBottom: 12 }} />
          <Skeleton width="30%" height={20} borderRadius={6} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={100} borderRadius={10} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={50} borderRadius={10} />
        </View>
      </ScrollView>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ErrorState
          title="Product not found"
          message={error?.message || 'Could not load details for this product.'}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / SCREEN_WIDTH);
                setActiveImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {images.map((img, idx) => (
                <View key={idx} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
                  <Image
                    source={{ uri: img.url }}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                    accessibilityLabel={img.altText || product.title}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { width: SCREEN_WIDTH, height: SCREEN_WIDTH, backgroundColor: theme.border || '#E2E8F0' },
              ]}
            >
              <Text style={{ color: theme.muted || '#64748B' }}>No image available</Text>
            </View>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        idx === activeImageIndex
                          ? theme.primary
                          : 'rgba(255, 255, 255, 0.65)',
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Details Body */}
        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text }]}>{product.title}</Text>
          <Text style={[styles.price, { color: theme.primary }]}>{formattedPrice}</Text>

          {/* Variant / Option Picker */}
          <VariantPicker
            product={product}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
          />

          {/* Description */}
          {product.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Description</Text>
              <Text style={[styles.descriptionText, { color: theme.muted || '#475569' }]}>
                {product.description}
              </Text>
            </View>
          ) : null}

          {/* Reviews Section (Conditional on Feature Flag) */}
          {config.features.reviews === 'mock' && (
            <View style={styles.reviewsContainer}>
              <View style={styles.reviewsHeader}>
                <Text style={[styles.sectionHeading, { color: theme.text }]}>Customer Reviews</Text>
                {reviewSummary && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={[styles.ratingNumber, { color: theme.text }]}>
                      {reviewSummary.averageRating}
                    </Text>
                    <Text style={[styles.ratingCount, { color: theme.muted || '#64748B' }]}>
                      ({reviewSummary.totalCount})
                    </Text>
                  </View>
                )}
              </View>

              {isLoadingReviews ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : reviewSummary && reviewSummary.reviews.length > 0 ? (
                reviewSummary.reviews.map((rev) => (
                  <View
                    key={rev.id}
                    style={[
                      styles.reviewCard,
                      {
                        backgroundColor: theme.card || '#FFFFFF',
                        borderColor: theme.border || '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.reviewTop}>
                      <Text style={[styles.reviewAuthor, { color: theme.text }]}>{rev.author}</Text>
                      <Text style={[styles.reviewDate, { color: theme.muted || '#94A3B8' }]}>
                        {rev.date}
                      </Text>
                    </View>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= rev.rating ? 'star' : 'star-outline'}
                          size={14}
                          color="#F59E0B"
                        />
                      ))}
                      {rev.verifiedPurchase && (
                        <Text style={[styles.verifiedBadge, { color: theme.success || '#059669' }]}>
                          ✓ Verified Purchase
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.reviewTitle, { color: theme.text }]}>{rev.title}</Text>
                    <Text style={[styles.reviewBody, { color: theme.muted || '#64748B' }]}>
                      {rev.content}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: theme.muted || '#64748B' }}>No reviews yet.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add to Cart Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.card || '#FFFFFF',
            borderTopColor: theme.border || '#E2E8F0',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            {
              backgroundColor: isAvailable ? theme.primary : '#94A3B8',
            },
          ]}
          onPress={handleAddToCart}
          disabled={!isAvailable || isSyncing}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isAvailable ? 'Add to cart' : 'Sold out'}
          accessibilityState={{ disabled: !isAvailable || isSyncing }}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : addedSuccess ? (
            <View style={styles.btnRow}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.addToCartText}>Added to Cart!</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
              <Text style={styles.addToCartText}>
                {isAvailable ? `Add to Cart • ${formattedPrice}` : 'Sold Out'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  carouselContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  body: {
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  reviewsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 15,
    fontWeight: '700',
  },
  ratingCount: {
    fontSize: 13,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  verifiedBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  addToCartButton: {
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

