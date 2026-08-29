import { useState, useMemo } from 'react';
import type { Entry, Notebook } from '../types';
import type { EntryService } from '../services/EntryService';

interface UseHomeControllerProps {
  notebookId?: string;
  entries: Entry[];
  notebooks: Notebook[];
  isLoaded: boolean;
  entryService: EntryService;
  onNavigateToNewEntry: (url: string) => void;
}

export function useHomeController({
  notebookId,
  entries,
  notebooks,
  isLoaded,
  entryService,
  onNavigateToNewEntry
}: UseHomeControllerProps) {
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

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
    onNavigateToNewEntry(`/entry/new?type=${type}${notebookId && notebookId !== 'all' ? `&notebookId=${notebookId}` : ''}`);
  };

  const toggleTask = async (id: string) => {
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
