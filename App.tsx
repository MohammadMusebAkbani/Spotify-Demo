import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MerchantProvider, useMerchant } from './src/config/MerchantProvider';
import { useCartStore } from './src/store/cartStore';
import { AppNavigator } from './src/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes default
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoot() {
  const { theme } = useMerchant();
  const initializeCart = useCartStore((state) => state.initializeCart);

  useEffect(() => {
    // Restore or create cart silently on launch
    initializeCart();
  }, [initializeCart]);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MerchantProvider>
          <AppRoot />
        </MerchantProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
