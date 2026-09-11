import { useMemo } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { EntryService } from '../services/EntryService';
import { NotebookService } from '../services/NotebookService';
import { SettingsService } from '../services/SettingsService';
import { SyncStateService } from '../services/SyncStateService';

export function useServices() {
  const db = useDatabase();
  
  return useMemo(() => {
    return {
      db,
      entryService: new EntryService(db),
      notebookService: new NotebookService(db),
      settingsService: new SettingsService(),
      syncStateService: new SyncStateService()
    };
  }, [db]);
}
