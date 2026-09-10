import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotebookService } from '../NotebookService';
import type { DatabaseAdapter } from '../../lib/db/DatabaseAdapter';
import type { Notebook, Entry } from '../../types';

describe('NotebookService', () => {
  let mockAdapter: DatabaseAdapter;
  let notebookService: NotebookService;

  beforeEach(() => {
    mockAdapter = {
      createNotebook: vi.fn(),
      updateNotebook: vi.fn(),
      deleteNotebookWithCascade: vi.fn(),
    } as unknown as DatabaseAdapter;
    notebookService = new NotebookService(mockAdapter);
  });

  const mockNotebook: Notebook = {
    id: 'nb-1',
    name: 'Work',
    icon: 'lucide-folder',
    createdAt: 1000,
    updatedAt: 1000,
  };

  it('should create a notebook via adapter', async () => {
    const result = await notebookService.createNotebook(mockNotebook);
    expect(mockAdapter.createNotebook).toHaveBeenCalledWith(mockNotebook);
    expect(result).toEqual(mockNotebook);
  });

  it('should update a notebook via adapter', async () => {
    const result = await notebookService.updateNotebook(mockNotebook);
    expect(mockAdapter.updateNotebook).toHaveBeenCalledWith(mockNotebook);
    expect(result).toEqual(mockNotebook);
  });

  it('should delete a notebook with cascade marking entries as trashed', async () => {
    const notebookEntries: Entry[] = [
      { id: 'e1', notebookId: 'nb-1', title: 'T1', content: 'C1', type: 'task', isCompleted: false, createdAt: 1, updatedAt: 1 },
      { id: 'e2', notebookId: 'nb-1', title: 'T2', content: 'C2', type: 'task', isCompleted: false, createdAt: 2, updatedAt: 2 },
    ];
    
    const now = Date.now();
    const result = await notebookService.deleteNotebookWithCascade('nb-1', notebookEntries);
    
    expect(result.deletedNotebookId).toBe('nb-1');
    expect(result.trashedEntries).toHaveLength(2);
    expect(result.trashedEntries[0].trashedAt).toBeGreaterThanOrEqual(now);
    expect(result.trashedEntries[1].trashedAt).toBeGreaterThanOrEqual(now);
    
    expect(mockAdapter.deleteNotebookWithCascade).toHaveBeenCalledWith('nb-1', result.trashedEntries);
  });
});
