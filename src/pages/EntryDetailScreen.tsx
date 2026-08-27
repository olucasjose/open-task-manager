import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { TopAppBar } from '../components/TopAppBar';
import { Edit2, Trash2 } from 'lucide-react';

import { db } from '../lib/db';
import type { Entry } from '../types';
import { ENTRY_STRATEGIES } from '../registry/EntryRegistry';
import { useStore } from '../store/useStore';

export function EntryDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isNew = id === 'new';
  const initialType = (searchParams.get('type') as 'task' | 'note' | 'reasoningLine') || 'note';
  const notebookId = searchParams.get('notebookId');
  const isReasoningLine = initialType === 'reasoningLine';

  const allEntries = useStore(state => state.entries);
  const isLoaded = useStore(state => state.isLoaded);

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
        await db.createEntry(newEntry);
        useStore.getState().refresh();
      } else {
        if (!entry) return;
        const updatedEntry: Entry = {
          ...entry,
          title: title || ENTRY_STRATEGIES[entry.type]?.defaultTitle || 'Sem Título',
          content,
          metadata,
          updatedAt: Date.now()
        };
        await db.updateEntry(updatedEntry);
        setEntry(updatedEntry);
        useStore.getState().refresh();
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
    navigate(-1);
  };

  const handleDelete = async () => {
    if (isNew || !entry) return;
    
    if (entry.trashedAt) {
      // Já está na lixeira, deleta definitivamente
      const confirm = window.confirm(`Deseja excluir permanentemente este item?`);
      if (!confirm) return;
      try {
        await db.deleteEntry(entry.id);
        useStore.getState().refresh();
        navigate(-1);
      } catch (error) {
        console.error('Erro ao deletar entrada:', error);
      }
    } else {
      // Manda pra lixeira
      const confirm = window.confirm(`Deseja enviar este item para a lixeira?`);
      if (!confirm) return;
      try {
        await db.updateEntry({ ...entry, trashedAt: Date.now() });
        useStore.getState().refresh();
        navigate(-1);
      } catch (error) {
        console.error('Erro ao mover para a lixeira:', error);
      }
    }
  };

  const currentType = entry?.type || initialType;
  const typeLabel = ENTRY_STRATEGIES[currentType]?.label || 'Item';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 flex-1 relative transition-colors min-h-screen">
      <TopAppBar 
        title={isEditing ? (isNew ? `Nova ${typeLabel}` : `Editando ${typeLabel}`) : ''} 
        showBackButton 
        onBackClick={handleBack}
        rightElement={
          !isNew ? (
            <button
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-red-500 dark:text-red-400 transition-colors"
              aria-label="Deletar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : undefined
        }
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-10 w-full">Carregando...</p>
        ) : (
          <>
            {/* PAINEL EDITOR (Esquerda) */}
            <div className={`flex-1 flex-col gap-4 p-6 overflow-y-auto pb-24 md:pb-6 ${isEditing ? 'flex' : 'hidden md:flex'} md:w-1/2 md:border-r md:border-gray-100 dark:md:border-gray-800 transition-all`}>
              {ENTRY_STRATEGIES[currentType]?.renderEditor({
                title,
                setTitle,
                content,
                setContent,
                metadata,
                setMetadata,
                isNew
              })}
            </div>

            <div className={`flex-1 flex-col p-6 overflow-y-auto pb-24 md:pb-6 ${!isEditing ? 'flex' : 'hidden md:flex'} md:w-1/2 transition-all bg-gray-50/30 dark:bg-gray-900/10`}>
              {entry || isNew ? (
                ENTRY_STRATEGIES[currentType]?.renderPreview({
                  title,
                  content,
                  metadata,
                  setMetadata,
                  isCompleted: entry?.isCompleted
                })
              ) : (
                <p className="text-red-500 dark:text-red-400 text-center mt-10">Registro não encontrado.</p>
              )}
            </div>
          </>
        )}
      </div>

      {!isEditing && !isNew && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute bottom-6 right-4 md:hidden w-14 h-14 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 z-10"
        >
          <Edit2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
