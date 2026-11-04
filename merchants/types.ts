export interface MerchantTheme {
  primary: string;
  background: string;
  text: string;
  accent: string;
  card?: string;
  border?: string;
  muted?: string;
  white?: string;
  error?: string;
  success?: string;
}

export interface MerchantFeatures {
  reviews: 'mock' | 'off';
  orders: boolean;
}

export interface MerchantConfig {
  id: string;
  brandName: string;
  shopDomain: string;
  storefrontToken: string;
  apiVersion: string;
  appId: string;
  scheme: string;
  theme: MerchantTheme;
  features: MerchantFeatures;
}

