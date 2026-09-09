import { useMemo } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { EntryService } from '../services/EntryService';
import { NotebookService } from '../services/NotebookService';
import { SettingsService } from '../services/SettingsService';

export function useServices() {
  const db = useDatabase();
  
  return useMemo(() => {
    const settingsService = new SettingsService();

    return {
      entryService: new EntryService(db),
      notebookService: new NotebookService(db),
      settingsService
    };
  }, [db]);
}
