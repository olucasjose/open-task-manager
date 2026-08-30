import { create } from 'zustand';
import type { Entry, Notebook } from '../types';

interface StoreState {
  entries: Entry[];
  notebooks: Notebook[];
  isLoaded: boolean;
  setStoreData: (entries: Entry[], notebooks: Notebook[]) => void;
  
  addEntry: (entry: Entry) => void;
  updateEntry: (entry: Entry) => void;
  removeEntry: (id: string) => void;
  
  addNotebook: (notebook: Notebook) => void;
  updateNotebook: (notebook: Notebook) => void;
  removeNotebook: (id: string) => void;
  
  cascadeDeleteNotebook: (notebookId: string, trashedEntries: Entry[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  entries: [],
  notebooks: [],
  isLoaded: false,
  setStoreData: (entries, notebooks) => set({ entries, notebooks, isLoaded: true }),
  
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  updateEntry: (entry) => set((state) => ({ entries: state.entries.map((e) => (e.id === entry.id ? entry : e)) })),
  removeEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
  
  addNotebook: (notebook) => set((state) => ({ notebooks: [notebook, ...state.notebooks] })),
  updateNotebook: (notebook) => set((state) => ({ notebooks: state.notebooks.map((n) => (n.id === notebook.id ? notebook : n)) })),
  removeNotebook: (id) => set((state) => ({ notebooks: state.notebooks.filter((n) => n.id !== id) })),
  
  cascadeDeleteNotebook: (notebookId, trashedEntries) => set((state) => {
    const trashedMap = new Map(trashedEntries.map(e => [e.id, e]));
    return {
      notebooks: state.notebooks.filter(n => n.id !== notebookId),
      entries: state.entries.map(e => trashedMap.has(e.id) ? trashedMap.get(e.id)! : e),
    };
  }),
}));
