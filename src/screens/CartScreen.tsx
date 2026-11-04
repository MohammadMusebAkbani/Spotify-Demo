import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { QuantityStepper } from '../components';
import { useMerchant } from '../config/MerchantProvider';
import { useCart } from '../hooks';
import { CartLine } from '../services/shopify/types';
import { formatMoney } from '../utils/format';

export const CartScreen: React.FC = () => {
  const { theme } = useMerchant();
  const navigation = useNavigation<any>();

  const {
    lines,
    totalQuantity,
    totalCost,
    cart,
    isLoading,
    isSyncing,
    updateQuantity,
    removeLine,
    validateCartBeforeCheckout,
    proceedToCheckoutUrl,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formattedTotal = formatMoney(totalCost?.amount, totalCost?.currencyCode);

  const handleCheckoutPress = async () => {
    if (!cart || lines.length === 0) return;

    setIsCheckingOut(true);
    try {
      const { freshCart, validation } = await validateCartBeforeCheckout();

      if (!freshCart) {
        Alert.alert('Checkout Error', 'Could not refresh cart data. Please try again.');
        setIsCheckingOut(false);
        return;
      }

      // Check for unavailable lines
      if (validation.unavailableLines.length > 0) {
        const itemNames = validation.unavailableLines
          .map((l) => l.merchandise.title)
          .join(', ');
        Alert.alert(
          'Items Unavailable',
          `The following items are no longer available: ${itemNames}. Please update your cart before proceeding.`,
          [{ text: 'Review Cart', style: 'cancel' }]
        );
        setIsCheckingOut(false);
        return;
      }

      // Check for price changes
      if (validation.priceChanged) {
        const oldPriceFormatted = formatMoney(validation.oldTotal);
        const newPriceFormatted = formatMoney(validation.newTotal);

        Alert.alert(
          'Cart Total Changed',
          `Some prices have changed since you added them. Your cart total has been updated from ${oldPriceFormatted} to ${newPriceFormatted}.`,
          [
            { text: 'Review Cart', style: 'cancel', onPress: () => setIsCheckingOut(false) },
            {
              text: 'Proceed to Checkout',
              onPress: async () => {
                await proceedToCheckoutUrl(freshCart);
                setIsCheckingOut(false);
              },
            },
          ]
        );
        return;
      }

      // Proceed directly
      await proceedToCheckoutUrl(freshCart);
    } catch (err: unknown) {
      Alert.alert(
        'Checkout Error',
        err instanceof Error ? err.message : 'An error occurred starting checkout.'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderCartLine = ({ item }: { item: CartLine }) => {
    const merchandise = item.merchandise;
    const title = merchandise.product?.title || merchandise.title;
    const variantTitle = merchandise.title;
    const isAvailable = merchandise.availableForSale;
    const price = item.cost.totalAmount;
    const formattedLinePrice = formatMoney(price.amount, price.currencyCode);
    const imageUrl = merchandise.image?.url;

    return (
      <View
        style={[
          styles.lineCard,
          {
            backgroundColor: theme.card || '#FFFFFF',
            borderColor: !isAvailable ? theme.error || '#EF4444' : theme.border || '#E2E8F0',
          },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.lineImage}
            resizeMode="cover"
            accessibilityLabel={title}
          />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.border || '#E2E8F0' }]}>
            <Ionicons name="image-outline" size={24} color={theme.muted || '#94A3B8'} />
          </View>
        )}

        <View style={styles.lineDetails}>
          <View style={styles.lineHeader}>
            <Text numberOfLines={1} style={[styles.productTitle, { color: theme.text }]}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={() => removeLine(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${title} from cart`}
            >
              <Ionicons name="close" size={20} color={theme.muted || '#94A3B8'} />
            </TouchableOpacity>
          </View>

          {variantTitle && variantTitle.toLowerCase() !== 'default title' && (
            <Text style={[styles.variantTitle, { color: theme.muted || '#64748B' }]}>
              {variantTitle}
            </Text>
          )}

          {!isAvailable && (
            <Text style={[styles.soldOutAlert, { color: theme.error || '#EF4444' }]}>
              Sold out - Please remove
            </Text>
          )}

          <View style={styles.lineFooter}>
            <Text style={[styles.linePrice, { color: theme.primary }]}>
              {formattedLinePrice}
            </Text>
            <QuantityStepper
              quantity={item.quantity}
              onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
              onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={isSyncing}
            />
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {lines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBg, { backgroundColor: `${theme.primary}15` }]}>
            <Ionicons name="cart-outline" size={54} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: theme.muted || '#64748B' }]}>
            Explore our collections and add your favorite items.
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Start Shopping"
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={lines}
            keyExtractor={(item) => item.id}
            renderItem={renderCartLine}
            contentContainerStyle={styles.listContent}
          />

          {/* Checkout Footer */}
          <View
            style={[
              styles.checkoutFooter,
              {
                backgroundColor: theme.card || '#FFFFFF',
                borderTopColor: theme.border || '#E2E8F0',
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>
                Total ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}):
              </Text>
              <Text style={[styles.totalAmount, { color: theme.primary }]}>
                {formattedTotal}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: theme.primary }]}
              onPress={handleCheckoutPress}
              disabled={isCheckingOut || isSyncing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Proceed to Checkout, total ${formattedTotal}`}
            >
              {isCheckingOut ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.checkoutBtnRow}>
                  <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  lineCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  lineImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  variantTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  soldOutAlert: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  lineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  linePrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
    lineHeight: 20,
  },
  shopButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  checkoutFooter: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  checkoutButton: {
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

