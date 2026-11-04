import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMerchant } from '../config/MerchantProvider';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  disabled = false,
}) => {
  const { theme } = useMerchant();

  const isDecrementDisabled = disabled || quantity <= min;
  const isIncrementDisabled = disabled || quantity >= max;

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.border || '#E2E8F0',
          backgroundColor: theme.background,
        },
      ]}
      accessibilityRole="adjustable"
      accessibilityLabel={`Quantity, ${quantity}`}
    >
      <TouchableOpacity
        style={[styles.button, isDecrementDisabled && styles.disabledButton]}
        onPress={onDecrement}
        disabled={isDecrementDisabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{ disabled: isDecrementDisabled }}
      >
        <Ionicons
          name={quantity === 1 && min === 0 ? 'trash-outline' : 'remove'}
          size={18}
          color={isDecrementDisabled ? theme.muted || '#94A3B8' : theme.text}
        />
      </TouchableOpacity>

      <View style={styles.quantityContainer}>
        <Text style={[styles.quantityText, { color: theme.text }]}>{quantity}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isIncrementDisabled && styles.disabledButton]}
        onPress={onIncrement}
        disabled={isIncrementDisabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: isIncrementDisabled }}
      >
        <Ionicons
          name="add"
          size={18}
          color={isIncrementDisabled ? theme.muted || '#94A3B8' : theme.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  quantityContainer: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

