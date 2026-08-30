import type { Entry } from '../types';
import type { EntryService } from '../services/EntryService';
import { useStore } from '../store/useStore';

interface UseTrashControllerProps {
  allEntries: Entry[];
  isLoaded: boolean;
  entryService: EntryService;
}

export function useTrashController({ allEntries, isLoaded, entryService }: UseTrashControllerProps) {

  const entries = allEntries.filter(e => e.trashedAt);

  const handleRestore = async (entry: Entry) => {
    try {
      const updated = await entryService.restoreEntry(entry);
      useStore.getState().updateEntry(updated);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao restaurar: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleHardDelete = async (id: string) => {
    const confirm = window.confirm("Deseja excluir permanentemente este item? Esta ação não pode ser desfeita.");
    if (!confirm) return;
    try {
      await entryService.deleteEntry(id);
      useStore.getState().removeEntry(id);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao excluir: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleEmptyTrash = async () => {
    const confirm = window.confirm("Deseja esvaziar a lixeira? Todos os itens serão excluídos permanentemente.");
    if (!confirm) return;
    try {
      const deletedIds = await entryService.emptyTrash(entries);
      deletedIds.forEach(id => useStore.getState().removeEntry(id));
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
