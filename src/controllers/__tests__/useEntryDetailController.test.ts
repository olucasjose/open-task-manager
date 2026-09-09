import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEntryDetailController } from '../useEntryDetailController';
import type { EntryService } from '../../services/EntryService';
import type { AppSettings, Entry } from '../../types';

describe('useEntryDetailController', () => {
  const mockEntryService = {
    createEntry: vi.fn(),
    updateEntry: vi.fn(),
    deleteEntry: vi.fn(),
    moveToTrash: vi.fn(),
  } as unknown as EntryService;

  const mockOnAddEntry = vi.fn();
  const mockOnUpdateEntry = vi.fn();
  const mockOnRemoveEntry = vi.fn();
  const mockOnNavigateBack = vi.fn();

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
    onAddEntry: mockOnAddEntry,
    onUpdateEntry: mockOnUpdateEntry,
    onRemoveEntry: mockOnRemoveEntry,
    onNavigateBack: mockOnNavigateBack,
    ...overrides,
  });

  it('should initialize as new entry correctly', () => {
    const { result } = renderHook(() => useEntryDetailController(getProps({ id: 'new', initialType: 'note' })));
    
    expect(result.current.isNew).toBe(true);
    expect(result.current.isEditing).toBe(true);
    expect(result.current.title).toBe('');
    expect(result.current.content).toBe('');
    expect(result.current.metadata).toBeNull();
  });

  it('should load existing entry', () => {
    const entry: Entry = { id: 'e1', title: 'T1', content: 'C1', type: 'task', createdAt: 1, updatedAt: 1 };
    const { result } = renderHook(() => useEntryDetailController(getProps({ id: 'e1', allEntries: [entry] })));
    
    expect(result.current.isNew).toBe(false);
    expect(result.current.entry).toEqual(entry);
    expect(result.current.title).toBe('T1');
    expect(result.current.content).toBe('C1');
  });

  it('should handle save new entry', async () => {
    const { result } = renderHook(() => useEntryDetailController(getProps({ id: 'new', initialType: 'task' })));
    
    act(() => {
      result.current.setTitle('New Task');
      result.current.setContent('Task Content');
    });

    const savedEntry = { id: 'generated', title: 'New Task', content: 'Task Content', type: 'task' };
    vi.mocked(mockEntryService.createEntry).mockResolvedValue(savedEntry as any);

    await act(async () => {
      await result.current.handleBack();
    });

    expect(mockEntryService.createEntry).toHaveBeenCalled();
    expect(mockOnAddEntry).toHaveBeenCalledWith(savedEntry);
    expect(mockOnNavigateBack).toHaveBeenCalled();
  });

  it('should handle save existing entry', async () => {
    const entry: Entry = { id: 'e1', title: 'Old', content: 'C1', type: 'task', createdAt: 1, updatedAt: 1 };
    const { result } = renderHook(() => useEntryDetailController(getProps({ id: 'e1', allEntries: [entry] })));
    
    act(() => {
      result.current.setTitle('Updated Task');
    });

    const savedEntry = { ...entry, title: 'Updated Task' };
    vi.mocked(mockEntryService.updateEntry).mockResolvedValue(savedEntry);

    await act(async () => {
      await result.current.handleBack();
    });

    expect(mockEntryService.updateEntry).toHaveBeenCalled();
    expect(mockOnUpdateEntry).toHaveBeenCalledWith(savedEntry);
  });

  it('should move to trash if not trashed', async () => {
    const entry: Entry = { id: 'e1', title: 'T1', content: 'C1', type: 'task', createdAt: 1, updatedAt: 1 };
    const { result } = renderHook(() => useEntryDetailController(getProps({ id: 'e1', allEntries: [entry] })));
    
    vi.mocked(window.confirm).mockReturnValue(true);
    vi.mocked(mockEntryService.moveToTrash).mockResolvedValue({ ...entry, trashedAt: Date.now() });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockEntryService.moveToTrash).toHaveBeenCalledWith(entry);
    expect(mockOnUpdateEntry).toHaveBeenCalled();
    expect(mockOnNavigateBack).toHaveBeenCalled();
  });

  it('should hard delete if already trashed', async () => {
    const entry: Entry = { id: 'e1', title: 'T1', content: 'C1', type: 'task', createdAt: 1, updatedAt: 1, trashedAt: 123 };
    const { result } = renderHook(() => useEntryDetailController(getProps({ id: 'e1', allEntries: [entry] })));
    
    vi.mocked(window.confirm).mockReturnValue(true);

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockEntryService.deleteEntry).toHaveBeenCalledWith('e1');
    expect(mockOnRemoveEntry).toHaveBeenCalledWith('e1');
    expect(mockOnNavigateBack).toHaveBeenCalled();
  });
});
