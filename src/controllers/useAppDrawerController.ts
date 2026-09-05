import type { Notebook, Entry, AppSettings } from '../types';
import type { NotebookService } from '../services/NotebookService';

interface UseAppDrawerControllerProps {
  notebookService: NotebookService;
  settings: AppSettings | null;
  onUpdateNotebook: (notebook: Notebook) => void;
  onCascadeDeleteNotebook: (notebookId: string, trashedEntries: Entry[]) => void;
  onNavigate: (path: string) => void;
}

export function useAppDrawerController({
  notebookService,
  settings,
  onUpdateNotebook,
  onCascadeDeleteNotebook,
  onNavigate
}: UseAppDrawerControllerProps) {
  
  const handleRenameNotebook = async (notebook: Notebook, newName: string) => {
    if (!newName.trim() || newName === notebook.name) return;
    try {
      const updated = await notebookService.updateNotebook({ ...notebook, name: newName });
      onUpdateNotebook(updated);
    } catch (err) {
      console.error('Erro ao renomear caderno:', err);
    }
  };

  const handleDeleteNotebook = async (notebook: Notebook, notebookEntries: Entry[]) => {
    const requireConfirm = settings?.requireDeleteConfirm !== false;
                     
    if(!requireConfirm || window.confirm(`Tem certeza que deseja excluir "${notebook.name}" e enviar seus itens para a lixeira?`)) {
      try {
        const { deletedNotebookId, trashedEntries } = await notebookService.deleteNotebookWithCascade(notebook.id, notebookEntries);
        onCascadeDeleteNotebook(deletedNotebookId, trashedEntries);
        onNavigate('/notebook/all');
      } catch (err) {
        console.error('Erro ao deletar caderno:', err);
      }
    }
  };

  return {
    handleRenameNotebook,
    handleDeleteNotebook
  };
}
