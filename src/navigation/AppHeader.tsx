import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMerchant } from '../config/MerchantProvider';

interface AppHeaderProps {
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  const { config, theme } = useMerchant();

  const isShoes = config.id === 'shoes';

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.card || '#FFFFFF',
          borderBottomColor: theme.border || '#E2E8F0',
        },
      ]}
      accessibilityRole="header"
    >
      <View style={styles.brandRow}>
        <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
          <Ionicons
            name={isShoes ? 'footsteps' : 'shirt-outline'}
            size={18}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.titleColumn}>
          <Text style={[styles.brandName, { color: theme.primary }]}>
            {config.brandName}
          </Text>
          {title ? (
            <Text style={[styles.subTitle, { color: theme.muted || '#64748B' }]}>{title}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});


