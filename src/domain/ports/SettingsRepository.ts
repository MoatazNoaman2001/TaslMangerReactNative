import type { Settings, ThemePreference } from '@/domain/entities/Settings';

/** Persistence boundary for app settings (currently just theme). */
export interface SettingsRepository {
  getSettings(): Settings;
  setTheme(pref: ThemePreference): void;
  subscribe(listener: () => void): () => void;
}
