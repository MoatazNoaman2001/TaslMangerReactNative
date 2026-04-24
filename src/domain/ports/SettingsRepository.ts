import type { Settings, ThemePreference } from '@/domain/entities/Settings';

export interface SettingsRepository {
  getSettings(): Settings;
  setTheme(pref: ThemePreference): void;
  subscribe(listener: () => void): () => void;
}
