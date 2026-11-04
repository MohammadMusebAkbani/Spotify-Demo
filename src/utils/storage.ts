import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getActiveMerchantId } from '../config/merchant';

export function getMerchantStorageKey(key: string): string {
  const merchantId = getActiveMerchantId();
  return `@shopify_${merchantId}_${key}`;
}

export const StorageService = {
  async getItem(key: string): Promise<string | null> {
    const scopedKey = getMerchantStorageKey(key);
    return AsyncStorage.getItem(scopedKey);
  },

  async setItem(key: string, value: string): Promise<void> {
    const scopedKey = getMerchantStorageKey(key);
    await AsyncStorage.setItem(scopedKey, value);
  },

  async removeItem(key: string): Promise<void> {
    const scopedKey = getMerchantStorageKey(key);
    await AsyncStorage.removeItem(scopedKey);
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },
};

export const SecureStorageService = {
  async getItem(key: string): Promise<string | null> {
    const scopedKey = getMerchantStorageKey(key).replace(/[^a-zA-Z0-9_.-]/g, '_');
    return SecureStore.getItemAsync(scopedKey);
  },

  async setItem(key: string, value: string): Promise<void> {
    const scopedKey = getMerchantStorageKey(key).replace(/[^a-zA-Z0-9_.-]/g, '_');
    await SecureStore.setItemAsync(scopedKey, value);
  },

  async removeItem(key: string): Promise<void> {
    const scopedKey = getMerchantStorageKey(key).replace(/[^a-zA-Z0-9_.-]/g, '_');
    await SecureStore.deleteItemAsync(scopedKey);
  },
};

