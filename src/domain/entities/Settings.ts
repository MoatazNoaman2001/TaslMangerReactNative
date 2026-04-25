/**
 * User-controlled app settings. Persisted to MMKV on every change so the
 * theme is restored before the first frame renders and avoids a flash.
 */
export type ThemePreference = 'light' | 'dark' | 'system';

export interface Settings {
  theme: ThemePreference;
}
