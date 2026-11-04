import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, ProductCard, ProductCardSkeleton } from '../components';
import { useMerchant } from '../config/MerchantProvider';
import { useCollections, useProducts } from '../hooks';
import { ProductListItem } from '../services/shopify/types';

export const ProductListScreen: React.FC = () => {
  const { theme } = useMerchant();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');

  const { data: collections = [], isLoading: isLoadingCollections } = useCollections();
  const {
    data: products = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useProducts(selectedCollection, searchInput.trim() ? searchInput.trim() : undefined);

  const handleProductPress = (product: ProductListItem) => {
    navigation.navigate('ProductDetail', { handle: product.handle, title: product.title });
  };

  const renderItem = ({ item }: { item: ProductListItem }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.card || '#FFFFFF',
            borderColor: theme.border || '#E2E8F0',
          },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.muted || '#94A3B8'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search products..."
          placeholderTextColor={theme.muted || '#94A3B8'}
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
          accessibilityLabel="Search products"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchInput('')}
            accessibilityLabel="Clear search text"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.muted || '#94A3B8'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Collection Filter Chips */}
      {collections.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              {
                borderColor: selectedCollection === null ? theme.primary : theme.border || '#E2E8F0',
                backgroundColor:
                  selectedCollection === null ? theme.primary : theme.card || '#FFFFFF',
              },
            ]}
            onPress={() => setSelectedCollection(null)}
            accessibilityRole="button"
            accessibilityLabel="All products filter"
            accessibilityState={{ selected: selectedCollection === null }}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedCollection === null ? '#FFFFFF' : theme.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {collections.map((col) => {
            const isSelected = selectedCollection === col.handle;
            return (
              <TouchableOpacity
                key={col.id}
                style={[
                  styles.chip,
                  {
                    borderColor: isSelected ? theme.primary : theme.border || '#E2E8F0',
                    backgroundColor: isSelected ? theme.primary : theme.card || '#FFFFFF',
                  },
                ]}
                onPress={() => setSelectedCollection(isSelected ? null : col.handle)}
                accessibilityRole="button"
                accessibilityLabel={`${col.title} filter`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {col.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  if (error && !products.length) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ErrorState
          title="Could not load products"
          message={error.message}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {renderHeader()}
          <View style={styles.skeletonGrid}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={56} color={theme.muted || '#94A3B8'} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No products found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.muted || '#94A3B8' }]}>
                {searchInput
                  ? `No matches for "${searchInput}". Try another keyword.`
                  : 'Check back soon for new arrivals.'}
              </Text>
            </View>
          }
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
        />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerArea: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  chipsScrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 6,
    paddingBottom: 24,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
