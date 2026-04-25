import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// ── Web storage (localStorage + SSR guard) ───────────────────
// Expo Router v6 evaluates modules in a web/SSR context even for
// mobile-first apps. Native storage modules crash there, so we
// branch on Platform.OS.
const webStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === "undefined") return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// ── Native storage (SecureStore + chunking for iOS 2KB limit) ─
const MAX_CHUNK = 1800;

const nativeStorage = {
  async getItem(key: string): Promise<string | null> {
    const countStr = await SecureStore.getItemAsync(`${key}.__chunks`);
    if (!countStr) return SecureStore.getItemAsync(key);
    const n = parseInt(countStr, 10);
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      const part = await SecureStore.getItemAsync(`${key}.__${i}`);
      if (part == null) return null;
      parts.push(part);
    }
    return parts.join("");
  },
  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= MAX_CHUNK) {
      await SecureStore.deleteItemAsync(`${key}.__chunks`);
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += MAX_CHUNK) {
      chunks.push(value.slice(i, i + MAX_CHUNK));
    }
    await SecureStore.setItemAsync(`${key}.__chunks`, String(chunks.length));
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}.__${i}`, chunks[i]);
    }
  },
  async removeItem(key: string): Promise<void> {
    const countStr = await SecureStore.getItemAsync(`${key}.__chunks`);
    if (countStr) {
      const n = parseInt(countStr, 10);
      await SecureStore.deleteItemAsync(`${key}.__chunks`);
      for (let i = 0; i < n; i++) {
        await SecureStore.deleteItemAsync(`${key}.__${i}`);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: Platform.OS === "web" ? webStorage : nativeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
