import { useTheme } from '../hooks/useTheme';

export function useSettingsController() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return {
    isDarkMode,
    toggleTheme,
  };
}
