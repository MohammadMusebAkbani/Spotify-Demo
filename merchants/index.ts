import clothesConfig from './clothes/config.json';
import shoesConfig from './shoes/config.json';
import { MerchantConfig } from './types';

export * from './types';

export const merchantRegistry: Record<string, MerchantConfig> = {
  clothes: clothesConfig as MerchantConfig,
  shoes: shoesConfig as MerchantConfig,
};

export const merchantAssets: Record<string, { logo: any; icon: any; splash: any }> = {
  clothes: {
    logo: require('./clothes/assets/logo.png'),
    icon: require('./clothes/assets/icon.png'),
    splash: require('./clothes/assets/splash.png'),
  },
  shoes: {
    logo: require('./shoes/assets/logo.png'),
    icon: require('./shoes/assets/icon.png'),
    splash: require('./shoes/assets/splash.png'),
  },
};

export const defaultMerchantId = 'clothes';
