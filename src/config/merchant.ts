import Constants from 'expo-constants';
import {
  merchantRegistry,
  merchantAssets,
  defaultMerchantId,
  MerchantConfig,
} from '../../merchants';

export function getActiveMerchantId(): string {
  // Constants.expoConfig?.extra is populated from app.config.ts
  const configMerchantId = Constants.expoConfig?.extra?.merchantId;
  const envMerchantId = process.env.EXPO_PUBLIC_MERCHANT || process.env.MERCHANT;
  const merchantId = configMerchantId || envMerchantId || defaultMerchantId;

  return merchantId;
}

export function getActiveMerchantAssets() {
  const merchantId = getActiveMerchantId();
  return merchantAssets[merchantId] || merchantAssets[defaultMerchantId];
}

export function getActiveMerchantConfig(): MerchantConfig {
  const merchantId = getActiveMerchantId();
  const config = merchantRegistry[merchantId];

  if (!config) {
    const validMerchants = Object.keys(merchantRegistry).join(', ');
    throw new Error(
      `[MultiTenant Error] Unknown merchant id "${merchantId}". Registered merchants are: ${validMerchants}. Check your MERCHANT env variable or app.config.ts.`
    );
  }

  return config;
}

export const activeMerchantConfig = getActiveMerchantConfig();
