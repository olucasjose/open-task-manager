import { create } from 'zustand';
import type { Entry, Notebook } from '../types';

interface StoreState {
  entries: Entry[];
  notebooks: Notebook[];
  isLoaded: boolean;
  setStoreData: (entries: Entry[], notebooks: Notebook[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  entries: [],
  notebooks: [],
  isLoaded: false,
  setStoreData: (entries, notebooks) => set({ entries, notebooks, isLoaded: true }),
}));
