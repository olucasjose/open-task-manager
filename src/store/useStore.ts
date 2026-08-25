import { create } from 'zustand';
import { db } from '../lib/db';
import type { Entry, Notebook } from '../types';

interface StoreState {
  entries: Entry[];
  notebooks: Notebook[];
  isLoaded: boolean;
  refresh: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  entries: [],
  notebooks: [],
  isLoaded: false,
  refresh: async () => {
    try {
      const [entries, notebooks] = await Promise.all([
        db.getEntries(),
        db.getNotebooks()
      ]);
      set({ entries, notebooks, isLoaded: true });
    } catch (error) {
      console.error('Failed to refresh store data from DB:', error);
    }
  }
}));
