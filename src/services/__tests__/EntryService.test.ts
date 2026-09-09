import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntryService } from '../EntryService';
import type { DatabaseAdapter } from '../../lib/db/DatabaseAdapter';
import type { Entry } from '../../types';

describe('EntryService', () => {
  let mockAdapter: DatabaseAdapter;
  let entryService: EntryService;

  beforeEach(() => {
    mockAdapter = {
      createEntry: vi.fn(),
      updateEntry: vi.fn(),
      deleteEntry: vi.fn(),
    } as unknown as DatabaseAdapter;
    entryService = new EntryService(mockAdapter);
  });

  const mockEntry: Entry = {
    id: 'entry-1',
    notebookId: 'nb-1',
    title: 'Test Entry',
    content: 'Content',
    createdAt: 1000,
    updatedAt: 1000,
  };

  it('should create an entry via adapter', async () => {
    const result = await entryService.createEntry(mockEntry);
    expect(mockAdapter.createEntry).toHaveBeenCalledWith(mockEntry);
    expect(result).toEqual(mockEntry);
  });

  it('should update an entry via adapter', async () => {
    const result = await entryService.updateEntry(mockEntry);
    expect(mockAdapter.updateEntry).toHaveBeenCalledWith(mockEntry);
    expect(result).toEqual(mockEntry);
  });

  it('should move an entry to trash', async () => {
    const now = Date.now();
    const result = await entryService.moveToTrash(mockEntry);
    expect(result.trashedAt).toBeDefined();
    expect(result.trashedAt).toBeGreaterThanOrEqual(now);
    expect(mockAdapter.updateEntry).toHaveBeenCalledWith(result);
  });

  it('should delete an entry via adapter', async () => {
    const result = await entryService.deleteEntry('entry-1');
    expect(mockAdapter.deleteEntry).toHaveBeenCalledWith('entry-1');
    expect(result).toEqual('entry-1');
  });

  it('should restore an entry from trash', async () => {
    const trashedEntry: Entry = { ...mockEntry, trashedAt: 2000 };
    const result = await entryService.restoreEntry(trashedEntry);
    expect(result.trashedAt).toBeUndefined();
    expect(mockAdapter.updateEntry).toHaveBeenCalledWith(result);
  });

  it('should empty trash for given entries', async () => {
    const entriesToEmpty = [
      { ...mockEntry, id: '1' },
      { ...mockEntry, id: '2' },
    ];
    const result = await entryService.emptyTrash(entriesToEmpty);
    expect(mockAdapter.deleteEntry).toHaveBeenCalledTimes(2);
    expect(mockAdapter.deleteEntry).toHaveBeenCalledWith('1');
    expect(mockAdapter.deleteEntry).toHaveBeenCalledWith('2');
    expect(result).toEqual(['1', '2']);
  });
});
