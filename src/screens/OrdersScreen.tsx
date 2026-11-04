import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { OrderRecord } from '../adapters/orders';
import { useMerchant } from '../config/MerchantProvider';
import { useOrders } from '../hooks';
import { formatDate, formatMoney } from '../utils/format';

/**
 * TODO: Customer Account API Integration
 * ---------------------------------------
 * When migrating from Shopify mock.shop to a live Shopify store with customer authentication:
 * 1. Implement OAuth / Customer Account API (Shopify 2024+ Headless Customer Accounts).
 * 2. Store customer access tokens securely in `expo-secure-store` via `SecureStorageService`.
 * 3. Implement `ShopifyCustomerAccountOrdersAdapter` in `src/adapters/orders/` querying:
 *    `customer { orders(first: 20) { edges { node { id name processedAt totalPrice { amount currencyCode } lineItems { ... } } } } }`
 * 4. Plug `ShopifyCustomerAccountOrdersAdapter` into `src/adapters/orders/index.ts` with zero changes to this OrdersScreen.
 */

export const OrdersScreen: React.FC = () => {
  const { theme } = useMerchant();
  const { orders, isLoading, isRefetching, refetch } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const renderOrderItem = ({ item }: { item: OrderRecord }) => {
    const formattedTotal = formatMoney(item.total.amount, item.total.currencyCode);
    const lineCount = item.lines.reduce((acc, l) => acc + l.quantity, 0);

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          {
            backgroundColor: theme.card || '#FFFFFF',
            borderColor: theme.border || '#E2E8F0',
          },
        ]}
        onPress={() => setSelectedOrder(item)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Order ${item.id}, status ${item.status}, total ${formattedTotal}`}
        accessibilityHint="Opens order details modal"
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.orderId, { color: theme.text }]}>{item.id}</Text>
            <Text style={[styles.orderDate, { color: theme.muted || '#64748B' }]}>
              {formatDate(item.date)}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${theme.primary}15` }]}>
            <Text style={[styles.statusText, { color: theme.primary }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Thumbnail Preview */}
        <View style={styles.previewRow}>
          <View style={styles.thumbnails}>
            {item.lines.slice(0, 3).map((line, idx) => (
              <View
                key={idx}
                style={[
                  styles.thumbWrapper,
                  { borderColor: theme.border || '#E2E8F0', backgroundColor: '#F8FAFC' },
                ]}
              >
                {line.imageUrl ? (
                  <Image
                    source={{ uri: line.imageUrl }}
                    style={styles.thumbImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <Ionicons name="cube-outline" size={16} color={theme.muted || '#94A3B8'} />
                )}
              </View>
            ))}
            {item.lines.length > 3 && (
              <View style={[styles.moreCount, { backgroundColor: theme.border || '#E2E8F0' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }}>
                  +{item.lines.length - 3}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.orderSummaryRight}>
            <Text style={[styles.itemCountText, { color: theme.muted || '#64748B' }]}>
              {lineCount} {lineCount === 1 ? 'item' : 'items'}
            </Text>
            <Text style={[styles.orderTotal, { color: theme.primary }]}>{formattedTotal}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Demo Notice Banner */}
      <View
        style={[
          styles.demoBanner,
          {
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}25`,
          },
        ]}
      >
        <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
        <View style={styles.demoBannerText}>
          <Text style={[styles.demoTag, { color: theme.primary }]}>Demo Orders</Text>
          <Text style={[styles.demoNote, { color: theme.muted || '#475569' }]}>
            Simulated local order history created when initiating checkout.
          </Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBg, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="receipt-outline" size={48} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.muted || '#64748B' }]}>
                Orders will appear here once you begin checkout.
              </Text>
            </View>
          ) : undefined
        }
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          visible={!!selectedOrder}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedOrder(null)}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.border || '#E2E8F0', backgroundColor: theme.card || '#FFFFFF' },
              ]}
            >
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Order Details
                </Text>
                <Text style={{ color: theme.muted || '#64748B', fontSize: 13 }}>
                  {selectedOrder.id}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedOrder(null)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close order details"
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View
                style={[
                  styles.modalSection,
                  { backgroundColor: theme.card || '#FFFFFF', borderColor: theme.border || '#E2E8F0' },
                ]}
              >
                <View style={styles.modalRow}>
                  <Text style={[styles.label, { color: theme.muted || '#64748B' }]}>Date:</Text>
                  <Text style={[styles.val, { color: theme.text }]}>
                    {formatDate(selectedOrder.date)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={[styles.label, { color: theme.muted || '#64748B' }]}>Status:</Text>
                  <Text style={[styles.val, { color: theme.primary, fontWeight: '700' }]}>
                    {selectedOrder.status}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={[styles.label, { color: theme.muted || '#64748B' }]}>Total:</Text>
                  <Text style={[styles.val, { color: theme.primary, fontWeight: '800', fontSize: 16 }]}>
                    {formatMoney(selectedOrder.total.amount, selectedOrder.total.currencyCode)}
                  </Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Items in this order</Text>

              {selectedOrder.lines.map((line, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.lineDetailCard,
                    { backgroundColor: theme.card || '#FFFFFF', borderColor: theme.border || '#E2E8F0' },
                  ]}
                >
                  {line.imageUrl ? (
                    <Image
                      source={{ uri: line.imageUrl }}
                      style={styles.modalLineImg}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: theme.border || '#E2E8F0' }]}>
                      <Ionicons name="cube-outline" size={20} color={theme.muted || '#94A3B8'} />
                    </View>
                  )}
                  <View style={styles.modalLineContent}>
                    <Text numberOfLines={2} style={[styles.modalItemTitle, { color: theme.text }]}>
                      {line.title}
                    </Text>
                    {line.variantTitle && line.variantTitle.toLowerCase() !== 'default title' && (
                      <Text style={[styles.modalItemVariant, { color: theme.muted || '#64748B' }]}>
                        {line.variantTitle}
                      </Text>
                    )}
                    <View style={styles.modalItemFooter}>
                      <Text style={{ color: theme.muted || '#64748B', fontSize: 13 }}>
                        Qty: {line.quantity}
                      </Text>
                      <Text style={[styles.modalItemPrice, { color: theme.primary }]}>
                        {formatMoney(line.price.amount, line.price.currencyCode)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  demoBannerText: {
    flex: 1,
  },
  demoTag: {
    fontWeight: '700',
    fontSize: 13,
  },
  demoNote: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  thumbWrapper: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  moreCount: {
    width: 30,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderSummaryRight: {
    alignItems: 'flex-end',
  },
  itemCountText: {
    fontSize: 12,
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    padding: 16,
  },
  modalSection: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
  },
  val: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  lineDetailCard: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  modalLineImg: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLineContent: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalItemVariant: {
    fontSize: 12,
  },
  modalItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
});
