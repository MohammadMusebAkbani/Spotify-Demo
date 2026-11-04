import { ExpoConfig, ConfigContext } from 'expo/config';
import clothesConfig from './merchants/clothes/config.json';
import shoesConfig from './merchants/shoes/config.json';

const merchantRegistry: Record<string, any> = {
  clothes: clothesConfig,
  shoes: shoesConfig,
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const merchantId = process.env.MERCHANT || 'clothes';
  const merchant = merchantRegistry[merchantId] || merchantRegistry.clothes;

  const expoConfig: any = {
    ...config,
    name: merchant.brandName,
    slug: `shopify-${merchant.id}`,
    version: '1.0.0',
    orientation: 'portrait',
    scheme: merchant.scheme,
    userInterfaceStyle: 'light',
    icon: `./merchants/${merchant.id}/assets/icon.png`,
    splash: {
      image: `./merchants/${merchant.id}/assets/splash.png`,
      resizeMode: 'contain',
      backgroundColor: merchant.theme.background,
    },
    plugins: [
      'expo-font',
      [
        'expo-splash-screen',
        {
          image: `./merchants/${merchant.id}/assets/splash.png`,
          resizeMode: 'contain',
          backgroundColor: merchant.theme.background,
        },
      ],
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: merchant.appId,
    },
    android: {
      package: merchant.appId,
      adaptiveIcon: {
        foregroundImage: `./merchants/${merchant.id}/assets/icon.png`,
        backgroundColor: merchant.theme.background,
      },
      predictiveBackGestureEnabled: false,
    },
    extra: {
      merchantId: merchant.id,
    },
  };

  return expoConfig as ExpoConfig;
};
