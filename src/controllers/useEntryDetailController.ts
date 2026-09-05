import { useState, useEffect } from 'react';
import type { Entry, AppSettings } from '../types';
import { ENTRY_STRATEGIES } from '../registry/EntryRegistry';
import type { EntryService } from '../services/EntryService';

interface UseEntryDetailControllerProps {
  id?: string;
  initialType?: 'task' | 'note' | 'reasoningLine';
  notebookId?: string | null;
  allEntries: Entry[];
  isLoaded: boolean;
  entryService: EntryService;
  settings: AppSettings | null;
  onAddEntry: (entry: Entry) => void;
  onUpdateEntry: (entry: Entry) => void;
  onRemoveEntry: (id: string) => void;
  onNavigateBack: () => void;
}

export function useEntryDetailController({ 
  id, 
  initialType = 'note', 
  notebookId,
  allEntries,
  isLoaded,
  entryService,
  settings,
  onAddEntry,
  onUpdateEntry,
  onRemoveEntry,
  onNavigateBack
}: UseEntryDetailControllerProps) {
  const isNew = id === 'new';
  const isReasoningLine = initialType === 'reasoningLine';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(isNew);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState<any>(isReasoningLine ? { stages: [] } : null);

  useEffect(() => {
    if (isNew || !isLoaded) return;
    
    const target = allEntries.find(e => e.id === id);
    if (target && (!entry || entry.id !== id)) {
      setEntry(target);
      setTitle(target.title || '');
      setContent(target.content || '');
      setMetadata(target.metadata || (target.type === 'reasoningLine' ? { stages: [] } : null));
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, isLoaded, allEntries]);

  const saveEntry = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      if (isNew) {
        const newEntry: Entry = {
          id: Date.now().toString(),
          type: initialType,
          title: title || ENTRY_STRATEGIES[initialType]?.defaultTitle || 'Sem Título',
          content,
          metadata,
          notebookId: notebookId || undefined,
          isCompleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const saved = await entryService.createEntry(newEntry);
        onAddEntry(saved);
      } else {
        if (!entry) return;
        const updatedEntry: Entry = {
          ...entry,
          title: title || ENTRY_STRATEGIES[entry.type]?.defaultTitle || 'Sem Título',
          content,
          metadata,
          updatedAt: Date.now()
        };
        const saved = await entryService.updateEntry(updatedEntry);
        onUpdateEntry(saved);
        setEntry(saved);
      }
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      alert('Erro ao salvar a anotação');
    }
  };

  const hasChanges = entry ? (
    title !== (entry.title || '') ||
    content !== (entry.content || '') ||
    JSON.stringify(metadata) !== JSON.stringify(entry.metadata || (entry.type === 'reasoningLine' ? { stages: [] } : null))
  ) : (title.trim() !== '' || content.trim() !== '' || (isReasoningLine && metadata?.stages?.length > 0));

  const handleBack = () => {
    if (hasChanges) {
      saveEntry();
    }
    
    if (isEditing && !isNew) {
      if (window.innerWidth < 768) {
        setIsEditing(false);
        return;
      }
    }
    onNavigateBack();
  };

  const handleDelete = async () => {
    if (isNew || !entry) return;
    
    if (entry.trashedAt) {
      if (settings?.requireDeleteConfirm !== false) {
        const confirm = window.confirm(`Deseja excluir permanentemente este item?`);
        if (!confirm) return;
      }
      try {
        await entryService.deleteEntry(entry.id);
        onRemoveEntry(entry.id);
        onNavigateBack();
      } catch (error) {
        console.error('Erro ao deletar entrada:', error);
      }
    } else {
      if (settings?.requireDeleteConfirm !== false) {
        const confirm = window.confirm(`Deseja enviar este item para a lixeira?`);
        if (!confirm) return;
      }
      try {
        const trashed = await entryService.moveToTrash(entry);
        onUpdateEntry(trashed);
        onNavigateBack();
      } catch (error) {
        console.error('Erro ao mover para a lixeira:', error);
      }
    }
  };

  const currentType = entry?.type || initialType;

  return {
    isNew,
    isLoading,
    entry,
    isEditing,
    setIsEditing,
    title,
    setTitle,
    content,
    setContent,
    metadata,
    setMetadata,
    currentType,
    hasChanges,
    handleBack,
    handleDelete,
  };
}
