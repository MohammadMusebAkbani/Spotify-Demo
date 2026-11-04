import React, { createContext, useContext, useMemo } from 'react';
import { MerchantConfig, MerchantTheme } from '../../merchants';
import { getActiveMerchantConfig } from './merchant';

interface MerchantContextValue {
  config: MerchantConfig;
  theme: MerchantTheme;
  assets: {
    logo: any;
    icon: any;
    splash: any;
  };
}

const MerchantContext = createContext<MerchantContextValue | null>(null);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useMemo(() => getActiveMerchantConfig(), []);
  const assets = useMemo(() => getActiveMerchantConfig() && require('../../merchants').merchantAssets[config.id], [config]);

  const value = useMemo<MerchantContextValue>(
    () => ({
      config,
      theme: config.theme,
      assets,
    }),
    [config, assets]
  );

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
};

export function useMerchant(): MerchantContextValue {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
}
