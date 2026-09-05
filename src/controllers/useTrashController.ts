import type { Entry, AppSettings } from '../types';
import type { EntryService } from '../services/EntryService';

interface UseTrashControllerProps {
  allEntries: Entry[];
  isLoaded: boolean;
  entryService: EntryService;
  settings: AppSettings | null;
  onUpdateEntry: (entry: Entry) => void;
  onRemoveEntry: (id: string) => void;
}

export function useTrashController({ allEntries, isLoaded, entryService, settings, onUpdateEntry, onRemoveEntry }: UseTrashControllerProps) {

  const entries = allEntries.filter(e => e.trashedAt);

  const handleRestore = async (entry: Entry) => {
    try {
      const updated = await entryService.restoreEntry(entry);
      onUpdateEntry(updated);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao restaurar: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (settings?.requireDeleteConfirm !== false) {
      const confirm = window.confirm("Deseja excluir permanentemente este item? Esta ação não pode ser desfeita.");
      if (!confirm) return;
    }
    
    try {
      await entryService.deleteEntry(id);
      onRemoveEntry(id);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao excluir: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleEmptyTrash = async () => {
    if (settings?.requireTrashConfirm !== false) {
      const confirm = window.confirm("Deseja esvaziar a lixeira? Todos os itens serão excluídos permanentemente.");
      if (!confirm) return;
    }

    try {
      const deletedIds = await entryService.emptyTrash(entries);
      deletedIds.forEach(id => onRemoveEntry(id));
    } catch (err: any) {
      console.error(err);
    }
  };

  return {
    isLoaded,
    entries,
    handleRestore,
    handleHardDelete,
    handleEmptyTrash,
  };
}
