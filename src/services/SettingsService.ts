import type { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  requireDeleteConfirm: true,
  requireTrashConfirm: true,
};

export class SettingsService {
  private readonly storageKey = 'app_settings';

  async getSettings(): Promise<AppSettings> {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse app settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save app settings to localStorage', e);
    }
  }
}
