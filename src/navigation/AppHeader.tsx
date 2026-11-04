import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useMerchant } from '../config/MerchantProvider';

interface AppHeaderProps {
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  const { config, theme, assets } = useMerchant();

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
        {assets?.logo ? (
          <Image
            source={assets.logo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel={`${config.brandName} Logo`}
          />
        ) : null}
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
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
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

