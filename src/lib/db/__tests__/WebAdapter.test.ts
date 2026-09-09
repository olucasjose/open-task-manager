import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebAdapter } from '../WebAdapter';

describe('WebAdapter', () => {
  let adapter: WebAdapter;

  beforeEach(async () => {
    // Reset IndexedDB environment
    window.indexedDB = new IDBFactory();

    adapter = new WebAdapter();
    await adapter.init();
  });

  it('creates and reads notebooks', async () => {
    await adapter.createNotebook({ id: 'nb1', name: 'Work', createdAt: 1, updatedAt: 1 });
    const nbs = await adapter.getNotebooks();
    expect(nbs.length).toBe(1);
    expect(nbs[0].name).toBe('Work');
  });

  it('creates, updates and deletes entry', async () => {
    await adapter.createEntry({ id: 'e1', title: 'Task 1', notebookId: 'nb1', type: 'task', isCompleted: false, createdAt: 1, updatedAt: 1 });
    
    let entries = await adapter.getEntries();
    expect(entries.length).toBe(1);
    
    await adapter.updateEntry({ id: 'e1', title: 'Task 1 edited', notebookId: 'nb1', type: 'task', isCompleted: true, createdAt: 1, updatedAt: 2 });
    entries = await adapter.getEntries();
    expect(entries[0].title).toBe('Task 1 edited');
    expect(entries[0].isCompleted).toBe(true);
    
    await adapter.deleteEntry('e1');
    entries = await adapter.getEntries();
    expect(entries.length).toBe(0);
  });

  it('deletes notebook with cascade', async () => {
    await adapter.createNotebook({ id: 'nb1', name: 'Work', createdAt: 1, updatedAt: 1 });
    await adapter.createEntry({ id: 'e1', notebookId: 'nb1', title: 'Task 1', type: 'task', isCompleted: false, createdAt: 1, updatedAt: 1 });
    
    const trashedEntry = { id: 'e1', notebookId: 'nb1', title: 'Task 1', type: 'task', isCompleted: false, isTrashed: true, createdAt: 1, updatedAt: 2 };
    
    await adapter.deleteNotebookWithCascade('nb1', [trashedEntry]);
    
    const nbs = await adapter.getNotebooks();
    expect(nbs.length).toBe(0);
    
    const entries = await adapter.getEntries();
    expect(entries[0].isTrashed).toBe(true);
  });
});
