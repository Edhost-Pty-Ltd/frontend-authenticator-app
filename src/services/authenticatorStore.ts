import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthenticatorAccount } from '@/types/authenticator';

function storageKey(userId: string) {
  return `authen.codes.v1.${userId}`;
}

async function read(key: string) {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function write(key: string, value: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function loadAccounts(userId: string): Promise<AuthenticatorAccount[]> {
  const raw = await read(storageKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AuthenticatorAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAccounts(userId: string, accounts: AuthenticatorAccount[]) {
  await write(storageKey(userId), JSON.stringify(accounts));
}
