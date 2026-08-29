import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useServices } from '../hooks/useServices';

export function useHomeController(notebookId?: string) {
  const { entryService } = useServices();
  const entries = useStore(state => state.entries);
  const notebooks = useStore(state => state.notebooks);
  const isLoaded = useStore(state => state.isLoaded);
  
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const navigate = useNavigate();

  const visibleEntries = useMemo(() => {
    let filtered = entries.filter(e => !e.trashedAt);
    if (notebookId && notebookId !== 'all') {
      filtered = filtered.filter(e => e.notebookId === notebookId);
    }
    return filtered;
  }, [entries, notebookId]);

  const notebookName = useMemo(() => {
    if (!notebookId || notebookId === 'all') return 'Todos os Itens';
    const nb = notebooks.find(n => n.id === notebookId);
    return nb?.name || 'Todos os Itens';
  }, [notebooks, notebookId]);

  const handleCreate = (type: 'task' | 'note' | 'reasoningLine') => {
    setIsFabMenuOpen(false);
    navigate(`/entry/new?type=${type}${notebookId && notebookId !== 'all' ? `&notebookId=${notebookId}` : ''}`);
  };

  const toggleTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const entry = entries.find(en => en.id === id);
      if (!entry) return;
      await entryService.updateEntry({ ...entry, isCompleted: !entry.isCompleted });
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao atualizar item: ${err?.message || JSON.stringify(err)}`);
    }
  };

  return {
    isLoaded,
    isFabMenuOpen,
    setIsFabMenuOpen,
    visibleEntries,
    notebookName,
    handleCreate,
    toggleTask,
  };
}
