import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettingsController } from '../useSettingsController';
import type { SettingsService } from '../../services/SettingsService';
import type { AppSettings } from '../../types';

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
  }),
}));

describe('useSettingsController', () => {
  const mockSettingsService = {
    saveSettings: vi.fn(),
  } as unknown as SettingsService;

  const mockOnUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getProps = (settings: AppSettings | null = { requireDeleteConfirm: true, requireTrashConfirm: true }) => ({
    settings,
    settingsService: mockSettingsService,
    onUpdateSettings: mockOnUpdateSettings,
  });

  it('should toggle requireDeleteConfirm', async () => {
    const { result } = renderHook(() => useSettingsController(getProps()));

    await act(async () => {
      await result.current.toggleRequireDeleteConfirm();
    });

    const expectedSettings = { requireDeleteConfirm: false, requireTrashConfirm: true };
    expect(mockSettingsService.saveSettings).toHaveBeenCalledWith(expectedSettings);
    expect(mockOnUpdateSettings).toHaveBeenCalledWith(expectedSettings);
  });

  it('should toggle requireTrashConfirm', async () => {
    const { result } = renderHook(() => useSettingsController(getProps()));

    await act(async () => {
      await result.current.toggleRequireTrashConfirm();
    });

    const expectedSettings = { requireDeleteConfirm: true, requireTrashConfirm: false };
    expect(mockSettingsService.saveSettings).toHaveBeenCalledWith(expectedSettings);
    expect(mockOnUpdateSettings).toHaveBeenCalledWith(expectedSettings);
  });
  
  it('should not throw if settings is null', async () => {
    const { result } = renderHook(() => useSettingsController(getProps(null)));

    await act(async () => {
      await result.current.toggleRequireTrashConfirm();
    });

    expect(mockSettingsService.saveSettings).not.toHaveBeenCalled();
  });
});
