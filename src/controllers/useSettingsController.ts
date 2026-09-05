import { useTheme } from '../hooks/useTheme';
import type { AppSettings } from '../types';
import type { SettingsService } from '../services/SettingsService';

interface UseSettingsControllerProps {
  settings: AppSettings | null;
  settingsService: SettingsService;
  onUpdateSettings: (settings: AppSettings) => void;
}

export function useSettingsController({ settings, settingsService, onUpdateSettings }: UseSettingsControllerProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const toggleRequireDeleteConfirm = async () => {
    if (!settings) return;
    const newSettings = { ...settings, requireDeleteConfirm: !settings.requireDeleteConfirm };
    await settingsService.saveSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const toggleRequireTrashConfirm = async () => {
    if (!settings) return;
    const newSettings = { ...settings, requireTrashConfirm: !settings.requireTrashConfirm };
    await settingsService.saveSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  return {
    isDarkMode,
    toggleTheme,
    settings,
    toggleRequireDeleteConfirm,
    toggleRequireTrashConfirm
  };
}
