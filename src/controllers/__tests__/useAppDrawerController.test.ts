import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppDrawerController } from '../useAppDrawerController';
import type { NotebookService } from '../../services/NotebookService';
import type { AppSettings } from '../../types';

describe('useAppDrawerController', () => {
  const mockNotebookService = {
    updateNotebook: vi.fn(),
    deleteNotebookWithCascade: vi.fn(),
  } as unknown as NotebookService;

  const mockOnUpdateNotebook = vi.fn();
  const mockOnCascadeDeleteNotebook = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getProps = (settings: AppSettings = { requireDeleteConfirm: true, requireTrashConfirm: true }) => ({
    notebookService: mockNotebookService,
    settings,
    onUpdateNotebook: mockOnUpdateNotebook,
    onCascadeDeleteNotebook: mockOnCascadeDeleteNotebook,
    onNavigate: mockOnNavigate,
  });

  it('should rename notebook', async () => {
    const notebook = { id: 'nb1', name: 'Old', icon: 'lucide-folder', createdAt: 1, updatedAt: 1 };
    vi.mocked(mockNotebookService.updateNotebook).mockResolvedValue({ ...notebook, name: 'New' });

    const { result } = renderHook(() => useAppDrawerController(getProps()));

    await act(async () => {
      await result.current.handleRenameNotebook(notebook, 'New');
    });

    expect(mockNotebookService.updateNotebook).toHaveBeenCalledWith({ ...notebook, name: 'New' });
    expect(mockOnUpdateNotebook).toHaveBeenCalledWith({ ...notebook, name: 'New' });
  });

  it('should not rename if name is empty or same', async () => {
    const notebook = { id: 'nb1', name: 'Old', icon: 'lucide-folder', createdAt: 1, updatedAt: 1 };
    
    const { result } = renderHook(() => useAppDrawerController(getProps()));

    await act(async () => {
      await result.current.handleRenameNotebook(notebook, '  ');
      await result.current.handleRenameNotebook(notebook, 'Old');
    });

    expect(mockNotebookService.updateNotebook).not.toHaveBeenCalled();
  });

  it('should delete notebook after confirmation', async () => {
    const notebook = { id: 'nb1', name: 'Old', icon: 'lucide-folder', createdAt: 1, updatedAt: 1 };
    const notebookEntries = [{ id: 'e1', notebookId: 'nb1', title: 'T1', content: 'C1', type: 'task' as const, isCompleted: false, createdAt: 1, updatedAt: 1 }];
    
    vi.mocked(window.confirm).mockReturnValue(true);
    vi.mocked(mockNotebookService.deleteNotebookWithCascade).mockResolvedValue({ deletedNotebookId: 'nb1', trashedEntries: [] });

    const { result } = renderHook(() => useAppDrawerController(getProps()));

    await act(async () => {
      await result.current.handleDeleteNotebook(notebook, notebookEntries);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockNotebookService.deleteNotebookWithCascade).toHaveBeenCalledWith('nb1', notebookEntries);
    expect(mockOnCascadeDeleteNotebook).toHaveBeenCalledWith('nb1', []);
    expect(mockOnNavigate).toHaveBeenCalledWith('/notebook/all');
  });

  it('should abort delete if not confirmed', async () => {
    const notebook = { id: 'nb1', name: 'Old', icon: 'lucide-folder', createdAt: 1, updatedAt: 1 };
    
    vi.mocked(window.confirm).mockReturnValue(false);

    const { result } = renderHook(() => useAppDrawerController(getProps()));

    await act(async () => {
      await result.current.handleDeleteNotebook(notebook, []);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockNotebookService.deleteNotebookWithCascade).not.toHaveBeenCalled();
  });
  
  it('should delete notebook without confirm if setting is false', async () => {
    const notebook = { id: 'nb1', name: 'Old', icon: 'lucide-folder', createdAt: 1, updatedAt: 1 };
    
    vi.mocked(mockNotebookService.deleteNotebookWithCascade).mockResolvedValue({ deletedNotebookId: 'nb1', trashedEntries: [] });

    const { result } = renderHook(() => useAppDrawerController(getProps({ requireDeleteConfirm: false, requireTrashConfirm: true })));

    await act(async () => {
      await result.current.handleDeleteNotebook(notebook, []);
    });

    expect(window.confirm).not.toHaveBeenCalled();
    expect(mockNotebookService.deleteNotebookWithCascade).toHaveBeenCalled();
  });
});
