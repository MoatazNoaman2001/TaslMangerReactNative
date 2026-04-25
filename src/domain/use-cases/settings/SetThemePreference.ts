import type { SettingsRepository } from '@/domain/ports/SettingsRepository';
import type { Settings, ThemePreference } from '@/domain/entities/Settings';

export class SetThemePreference {
  constructor(private readonly settings: SettingsRepository) {}
  execute(pref: ThemePreference): void {
    this.settings.setTheme(pref);
  }
}
