import { createMMKV } from 'react-native-mmkv';
import type { z } from 'zod';

const storage = createMMKV({ id: 'taskforge-application' });

export const STORAGE_KEYS = {
  projects: 'projects',
  tasks: 'tasks',
  settings: 'settings',
} as const;

export function readStorage<T>(key: string, schema: z.ZodType<T>): T | null {
  const raw = storage.getString(key);
  if (raw == null) return null;

  try {
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.warn(`[storage] schema mismatch for "${key}":`, result.error.issues);
      return null;
    }
    return result.data;
  } catch (err) {
    console.warn(`[storage] JSON parse failed for "${key}":`, err);
    return null;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeStorage(key: string): void {
  storage.remove(key);
}

export function clearStorage(): void {
  storage.clearAll();
}
