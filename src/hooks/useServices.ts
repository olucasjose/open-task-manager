import { useMemo } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { EntryService } from '../services/EntryService';
import { NotebookService } from '../services/NotebookService';
import { SettingsService } from '../services/SettingsService';
import { useStore } from '../store/useStore';

export function useServices() {
  const db = useDatabase();
  
  return useMemo(() => {
    const settingsService = new SettingsService();

    const refreshFromDatabase = async () => {
      const [entries, notebooks] = await Promise.all([db.getEntries(), db.getNotebooks()]);
      useStore.getState().setStoreData(entries, notebooks);
    };

    return {
      entryService: new EntryService(db),
      notebookService: new NotebookService(db),
      settingsService,
      refreshFromDatabase
    };
  }, [db]);
}
