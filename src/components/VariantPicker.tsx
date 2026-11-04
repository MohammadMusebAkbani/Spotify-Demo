import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMerchant } from '../config/MerchantProvider';
import { ProductDetail, ProductVariant } from '../services/shopify/types';

interface VariantPickerProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const VariantPicker: React.FC<VariantPickerProps> = ({
  product,
  selectedVariant,
  onSelectVariant,
}) => {
  const { theme } = useMerchant();
  const variants = product.variants?.nodes ?? [];

  // If there's only 1 default variant ("Default Title"), no picker needed
  if (variants.length <= 1 && variants[0]?.title.toLowerCase() === 'default title') {
    return null;
  }

  // If product has distinct options (e.g., Size, Color)
  const options = product.options && product.options.length > 0 ? product.options : null;

  if (options && options.length > 0) {
    return (
      <View style={styles.container}>
        {options.map((option) => {
          return (
            <View key={option.name} style={styles.optionSection}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                {option.name}
              </Text>
              <View style={styles.valuesList}>
                {option.values.map((val) => {
                  // Find if current selected variant matches this value for this option
                  const isSelected = selectedVariant?.selectedOptions?.some(
                    (so) => so.name === option.name && so.value === val
                  );

                  // Find if any variant with this option is available for sale
                  // when combined with the other currently selected options
                  const matchingVariant = variants.find((v) => {
                    const matchesThis = v.selectedOptions?.some(
                      (so) => so.name === option.name && so.value === val
                    );
                    const matchesOthers = v.selectedOptions?.every((so) => {
                      if (so.name === option.name) return true;
                      const currentValForOther = selectedVariant?.selectedOptions?.find(
                        (curSo) => curSo.name === so.name
                      )?.value;
                      return !currentValForOther || so.value === currentValForOther;
                    });
                    return matchesThis && matchesOthers;
                  }) || variants.find((v) =>
                    v.selectedOptions?.some((so) => so.name === option.name && so.value === val)
                  );

                  const isAvailable = matchingVariant?.availableForSale ?? true;

                  return (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.chip,
                        {
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border || '#E2E8F0',
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.card || '#FFFFFF',
                        },
                        !isAvailable && styles.unavailableChip,
                      ]}
                      onPress={() => {
                        if (matchingVariant) {
                          onSelectVariant(matchingVariant);
                        }
                      }}
                      disabled={!isAvailable}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${option.name} ${val}${!isAvailable ? ', unavailable' : ''}`}
                      accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : isAvailable
                              ? theme.text
                              : theme.muted || '#94A3B8',
                          },
                          !isAvailable && styles.strikethroughText,
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Fallback: direct list of variants
  return (
    <View style={styles.container}>
      <Text style={[styles.optionTitle, { color: theme.text }]}>Select Variant</Text>
      <View style={styles.valuesList}>
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          const isAvailable = v.availableForSale;

          return (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? theme.primary : theme.border || '#E2E8F0',
                  backgroundColor: isSelected ? theme.primary : theme.card || '#FFFFFF',
                },
                !isAvailable && styles.unavailableChip,
              ]}
              onPress={() => onSelectVariant(v)}
              disabled={!isAvailable}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${v.title}${!isAvailable ? ', unavailable' : ''}`}
              accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : isAvailable
                      ? theme.text
                      : theme.muted || '#94A3B8',
                  },
                ]}
              >
                {v.title}
                {!isAvailable ? ' (Sold Out)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  optionSection: {
    marginBottom: 14,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableChip: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
  },
});

