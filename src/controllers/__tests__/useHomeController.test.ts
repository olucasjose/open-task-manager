import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHomeController } from '../useHomeController';
import type { EntryService } from '../../services/EntryService';
import type { Entry, Notebook } from '../../types';

describe('useHomeController', () => {
  const mockEntryService = {
    updateEntry: vi.fn(),
  } as unknown as EntryService;

  const mockOnNavigateToNewEntry = vi.fn();
  const mockOnUpdateEntry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getProps = (overrides = {}) => ({
    notebookId: 'all',
    entries: [],
    notebooks: [],
    isLoaded: true,
    entryService: mockEntryService,
    onNavigateToNewEntry: mockOnNavigateToNewEntry,
    onUpdateEntry: mockOnUpdateEntry,
    ...overrides,
  });

  it('should filter visible entries (no trashed, match notebook)', () => {
    const entries: Entry[] = [
      { id: '1', notebookId: 'nb1', title: 'A', content: 'A', createdAt: 1, updatedAt: 1, type: 'task' },
      { id: '2', notebookId: 'nb2', title: 'B', content: 'B', createdAt: 1, updatedAt: 1, type: 'note' },
      { id: '3', notebookId: 'nb1', title: 'C', content: 'C', createdAt: 1, updatedAt: 1, trashedAt: 123, type: 'task' },
    ];
    
    let { result } = renderHook(() => useHomeController(getProps({ entries })));
    expect(result.current.visibleEntries).toHaveLength(2);
    
    const { result: resNb1 } = renderHook(() => useHomeController(getProps({ entries, notebookId: 'nb1' })));
    expect(resNb1.current.visibleEntries).toHaveLength(1);
  });

  it('should get correct notebook name', () => {
    const notebooks: Notebook[] = [{ id: 'nb1', name: 'Work', createdAt: 1, updatedAt: 1 }];
    
    let { result } = renderHook(() => useHomeController(getProps({ notebooks, notebookId: 'all' })));
    expect(result.current.notebookName).toBe('Todos os Itens');
    
    const { result: resNb1 } = renderHook(() => useHomeController(getProps({ notebooks, notebookId: 'nb1' })));
    expect(resNb1.current.notebookName).toBe('Work');
  });

  it('should handle navigate to new entry', () => {
    const { result } = renderHook(() => useHomeController(getProps({ notebookId: 'nb1' })));
    
    act(() => {
      result.current.handleCreate('task');
    });
    
    expect(result.current.isFabMenuOpen).toBe(false);
    expect(mockOnNavigateToNewEntry).toHaveBeenCalledWith('/entry/new?type=task&notebookId=nb1');
  });

  it('should toggle task completion', async () => {
    const entry: Entry = { id: '1', isCompleted: false, notebookId: 'nb1', title: 'A', content: 'A', createdAt: 1, updatedAt: 1, type: 'task' };
    
    vi.mocked(mockEntryService.updateEntry).mockResolvedValue({ ...entry, isCompleted: true } as any);
    
    const { result } = renderHook(() => useHomeController(getProps({ entries: [entry] })));
    
    await act(async () => {
      await result.current.toggleTask('1');
    });
    
    expect(mockEntryService.updateEntry).toHaveBeenCalledWith({ ...entry, isCompleted: true });
    expect(mockOnUpdateEntry).toHaveBeenCalledWith({ ...entry, isCompleted: true });
  });
});
