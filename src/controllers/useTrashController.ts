import { useStore } from '../store/useStore';
import { useServices } from '../hooks/useServices';
import type { Entry } from '../types';

export function useTrashController() {
  const { entryService } = useServices();
  const allEntries = useStore(state => state.entries);
  const isLoaded = useStore(state => state.isLoaded);
  
  const entries = allEntries.filter(e => e.trashedAt);

  const handleRestore = async (e: React.MouseEvent, entry: Entry) => {
    e.stopPropagation();
    try {
      await entryService.restoreEntry(entry);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao restaurar: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleHardDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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
