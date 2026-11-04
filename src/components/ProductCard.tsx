import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useMerchant } from '../config/MerchantProvider';
import { ProductListItem } from '../services/shopify/types';
import { formatMoney } from '../utils/format';

interface ProductCardProps {
  product: ProductListItem;
  onPress: (product: ProductListItem) => void;
}

export const ProductCard = React.memo<ProductCardProps>(({ product, onPress }) => {
  const { theme } = useMerchant();

  const isSoldOut = !product.availableForSale;
  const price = product.priceRange.minVariantPrice;
  const formattedPrice = formatMoney(price.amount, price.currencyCode);
  const imageUrl = product.featuredImage?.url || product.images?.nodes?.[0]?.url;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card || '#FFFFFF',
          borderColor: theme.border || '#E2E8F0',
        },
      ]}
      onPress={() => onPress(product)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formattedPrice}${isSoldOut ? ', Sold out' : ''}`}
      accessibilityHint="Opens product details"
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            accessibilityLabel={product.featuredImage?.altText || product.title}
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.border || '#E2E8F0' }]}>
            <Text style={[styles.placeholderText, { color: theme.muted || '#64748B' }]}>No Image</Text>
          </View>
        )}

        {isSoldOut && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={2}
          style={[styles.title, { color: theme.text }]}
        >
          {product.title}
        </Text>

        <Text style={[styles.price, { color: theme.primary }]}>
          {formattedPrice}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  soldOutBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldOutText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 64,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
});

