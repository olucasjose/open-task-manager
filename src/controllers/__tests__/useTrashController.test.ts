import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTrashController } from '../useTrashController';
import type { EntryService } from '../../services/EntryService';
import type { AppSettings, Entry } from '../../types';

describe('useTrashController', () => {
  const mockEntryService = {
    restoreEntry: vi.fn(),
    deleteEntry: vi.fn(),
    emptyTrash: vi.fn(),
  } as unknown as EntryService;

  const mockOnUpdateEntry = vi.fn();
  const mockOnRemoveEntry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn());
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getProps = (overrides = {}) => ({
    allEntries: [],
    isLoaded: true,
    entryService: mockEntryService,
    settings: { requireDeleteConfirm: true, requireTrashConfirm: true } as AppSettings,
    onUpdateEntry: mockOnUpdateEntry,
    onRemoveEntry: mockOnRemoveEntry,
    ...overrides,
  });

  it('should filter only trashed entries', () => {
    const entries: Entry[] = [
      { id: '1', title: 'A', content: 'A', createdAt: 1, updatedAt: 1, type: 'task' },
      { id: '2', title: 'B', content: 'B', createdAt: 1, updatedAt: 1, trashedAt: 123, type: 'note' },
    ];

    const { result } = renderHook(() => useTrashController(getProps({ allEntries: entries })));

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('2');
  });

  it('should handle restore entry', async () => {
    const entry: Entry = { id: '2', title: 'B', content: 'B', createdAt: 1, updatedAt: 1, trashedAt: 123, type: 'note' };
    
    vi.mocked(mockEntryService.restoreEntry).mockResolvedValue({ ...entry, trashedAt: undefined });

    const { result } = renderHook(() => useTrashController(getProps()));

    await act(async () => {
      await result.current.handleRestore(entry);
    });

    expect(mockEntryService.restoreEntry).toHaveBeenCalledWith(entry);
    expect(mockOnUpdateEntry).toHaveBeenCalledWith({ ...entry, trashedAt: undefined });
  });

  it('should handle hard delete with confirmation', async () => {
    vi.mocked(window.confirm).mockReturnValue(true);

    const { result } = renderHook(() => useTrashController(getProps()));

    await act(async () => {
      await result.current.handleHardDelete('2');
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockEntryService.deleteEntry).toHaveBeenCalledWith('2');
    expect(mockOnRemoveEntry).toHaveBeenCalledWith('2');
  });

  it('should abort hard delete if not confirmed', async () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    const { result } = renderHook(() => useTrashController(getProps()));

    await act(async () => {
      await result.current.handleHardDelete('2');
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockEntryService.deleteEntry).not.toHaveBeenCalled();
  });

  it('should handle empty trash with confirmation', async () => {
    const entries: Entry[] = [
      { id: '1', title: 'A', content: 'A', createdAt: 1, updatedAt: 1, trashedAt: 123, type: 'task' },
    ];
    
    vi.mocked(window.confirm).mockReturnValue(true);
    vi.mocked(mockEntryService.emptyTrash).mockResolvedValue(['1']);

    const { result } = renderHook(() => useTrashController(getProps({ allEntries: entries })));

    await act(async () => {
      await result.current.handleEmptyTrash();
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockEntryService.emptyTrash).toHaveBeenCalledWith(entries);
    expect(mockOnRemoveEntry).toHaveBeenCalledWith('1');
  });

  it('should abort empty trash if not confirmed', async () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    const { result } = renderHook(() => useTrashController(getProps()));

    await act(async () => {
      await result.current.handleEmptyTrash();
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockEntryService.emptyTrash).not.toHaveBeenCalled();
  });
});
