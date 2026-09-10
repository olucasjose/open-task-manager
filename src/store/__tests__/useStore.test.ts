import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../useStore';
import type { Entry, Notebook, AppSettings } from '../../types';

describe('useStore', () => {
  const initialState = useStore.getState();

  beforeEach(() => {
    useStore.setState(initialState, true);
  });

  const mockEntry: Entry = {
    id: 'e1',
    notebookId: 'nb1',
    title: 'Title',
    content: 'Content',
    type: 'task',
    isCompleted: false,
    createdAt: 1000,
    updatedAt: 1000,
  };

  const mockNotebook: Notebook = {
    id: 'nb1',
    name: 'Notebook 1',
    icon: 'lucide-folder',
    createdAt: 1000,
    updatedAt: 1000,
  };

  const mockSettings: AppSettings = {
    requireDeleteConfirm: false,
    requireTrashConfirm: false,
  };

  it('should have correct initial state', () => {
    const state = useStore.getState();
    expect(state.entries).toEqual([]);
    expect(state.notebooks).toEqual([]);
    expect(state.settings).toBeNull();
    expect(state.isLoaded).toBe(false);
  });

  it('should set store data and mark as loaded', () => {
    useStore.getState().setStoreData([mockEntry], [mockNotebook]);
    const state = useStore.getState();
    expect(state.entries).toEqual([mockEntry]);
    expect(state.notebooks).toEqual([mockNotebook]);
    expect(state.isLoaded).toBe(true);
  });

  it('should set settings', () => {
    useStore.getState().setSettings(mockSettings);
    expect(useStore.getState().settings).toEqual(mockSettings);
  });

  it('should add entry at the beginning of the list', () => {
    const e2: Entry = { ...mockEntry, id: 'e2' };
    useStore.getState().addEntry(mockEntry);
    useStore.getState().addEntry(e2);
    
    const state = useStore.getState();
    expect(state.entries).toHaveLength(2);
    expect(state.entries[0].id).toBe('e2');
    expect(state.entries[1].id).toBe('e1');
  });

  it('should update entry', () => {
    useStore.getState().addEntry(mockEntry);
    const updated = { ...mockEntry, title: 'Updated' };
    useStore.getState().updateEntry(updated);
    
    const state = useStore.getState();
    expect(state.entries[0].title).toBe('Updated');
  });

  it('should remove entry', () => {
    useStore.getState().addEntry(mockEntry);
    useStore.getState().removeEntry('e1');
    
    expect(useStore.getState().entries).toHaveLength(0);
  });

  it('should add notebook at the beginning of the list', () => {
    const nb2: Notebook = { ...mockNotebook, id: 'nb2' };
    useStore.getState().addNotebook(mockNotebook);
    useStore.getState().addNotebook(nb2);
    
    const state = useStore.getState();
    expect(state.notebooks).toHaveLength(2);
    expect(state.notebooks[0].id).toBe('nb2');
    expect(state.notebooks[1].id).toBe('nb1');
  });

  it('should update notebook', () => {
    useStore.getState().addNotebook(mockNotebook);
    const updated = { ...mockNotebook, name: 'Updated' };
    useStore.getState().updateNotebook(updated);
    
    expect(useStore.getState().notebooks[0].name).toBe('Updated');
  });

  it('should remove notebook', () => {
    useStore.getState().addNotebook(mockNotebook);
    useStore.getState().removeNotebook('nb1');
    
    expect(useStore.getState().notebooks).toHaveLength(0);
  });

  it('should cascade delete notebook and update entries correctly', () => {
    const entry2: Entry = { ...mockEntry, id: 'e2', notebookId: 'nb2' };
    
    useStore.getState().setStoreData([mockEntry, entry2], [mockNotebook, { ...mockNotebook, id: 'nb2' }]);
    
    const trashedEntry1 = { ...mockEntry, trashedAt: Date.now() };
    
    useStore.getState().cascadeDeleteNotebook('nb1', [trashedEntry1]);
    
    const state = useStore.getState();
    
    expect(state.notebooks).toHaveLength(1);
    expect(state.notebooks[0].id).toBe('nb2');
    
    expect(state.entries).toHaveLength(2);
    
    const e1InStore = state.entries.find(e => e.id === 'e1');
    expect(e1InStore?.trashedAt).toBeDefined();
    
    const e2InStore = state.entries.find(e => e.id === 'e2');
    expect(e2InStore?.trashedAt).toBeUndefined();
  });
});
