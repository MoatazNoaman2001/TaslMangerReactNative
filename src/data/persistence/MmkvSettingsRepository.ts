import { create } from 'zustand';
import type { Settings, ThemePreference } from '@/domain/entities/Settings';
import type { SettingsRepository } from '@/domain/ports/SettingsRepository';
import { readStorage, writeStorage, STORAGE_KEYS } from './mmkv';
import { SettingsSchema } from './schemas';

const settingsStore = create<Settings>(() => {
  const stored = readStorage(STORAGE_KEYS.settings, SettingsSchema);
  return { theme: stored?.theme ?? 'system' };
});

export class MmkvSettingsRepository implements SettingsRepository {
  getSettings(): Settings {
    return settingsStore.getState();
  }

  setTheme(pref: ThemePreference): void {
    settingsStore.setState({ theme: pref });
    writeStorage(STORAGE_KEYS.settings, { theme: pref });
  }

  subscribe(listener: () => void): () => void {
    return settingsStore.subscribe(listener);
  }
}

export const useSettingsCache = settingsStore;
