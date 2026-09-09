import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsService, DEFAULT_SETTINGS } from '../SettingsService';
import type { AppSettings } from '../../types';

describe('SettingsService', () => {
  let settingsService: SettingsService;
  
  beforeEach(() => {
    settingsService = new SettingsService();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return DEFAULT_SETTINGS when localStorage is empty', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    const settings = await settingsService.getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(localStorage.getItem).toHaveBeenCalledWith('app_settings');
  });

  it('should return merged settings when localStorage has data', async () => {
    const storedSettings = { requireDeleteConfirm: false };
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(storedSettings));
    
    const settings = await settingsService.getSettings();
    expect(settings).toEqual({
      ...DEFAULT_SETTINGS,
      ...storedSettings
    });
  });

  it('should fallback to DEFAULT_SETTINGS on parse error', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('invalid-json');
    
    const settings = await settingsService.getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(console.error).toHaveBeenCalled();
  });

  it('should save settings to localStorage', async () => {
    const newSettings: AppSettings = {
      requireDeleteConfirm: false,
      requireTrashConfirm: false,
    };
    
    await settingsService.saveSettings(newSettings);
    expect(localStorage.setItem).toHaveBeenCalledWith('app_settings', JSON.stringify(newSettings));
  });
  
  it('should handle save settings error', async () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    
    const newSettings: AppSettings = {
      requireDeleteConfirm: false,
      requireTrashConfirm: false,
    };
    
    await settingsService.saveSettings(newSettings);
    expect(console.error).toHaveBeenCalled();
  });
});
