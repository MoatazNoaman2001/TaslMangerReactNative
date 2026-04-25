import type { SettingsRepository } from '@/domain/ports/SettingsRepository';
import type { Settings, ThemePreference } from '@/domain/entities/Settings';

/** Persists the user's theme choice. Not reversible — settings are not
 *  routed through the history bus. */
export class SetThemePreference {
  constructor(private readonly settings: SettingsRepository) {}
  execute(pref: ThemePreference): void {
    this.settings.setTheme(pref);
  }
}
