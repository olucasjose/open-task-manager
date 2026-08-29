import type { Entry } from '../types';
import type { EntryService } from '../services/EntryService';

interface UseTrashControllerProps {
  allEntries: Entry[];
  isLoaded: boolean;
  entryService: EntryService;
}

export function useTrashController({ allEntries, isLoaded, entryService }: UseTrashControllerProps) {

  const entries = allEntries.filter(e => e.trashedAt);

  const handleRestore = async (entry: Entry) => {
    try {
      await entryService.restoreEntry(entry);
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
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao excluir: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleEmptyTrash = async () => {
    const confirm = window.confirm("Deseja esvaziar a lixeira? Todos os itens serão excluídos permanentemente.");
    if (!confirm) return;
    try {
      await entryService.emptyTrash(entries);
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
