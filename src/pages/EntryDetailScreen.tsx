import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/TopAppBar';
import { Edit2, Trash2 } from 'lucide-react';

import { ENTRY_STRATEGIES } from '../registry/EntryRegistry';
import { useEntryDetailController } from '../controllers/useEntryDetailController';
import { useStore } from '../store/useStore';
import { useServices } from '../hooks/useServices';

export function EntryDetailScreen() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialType = (searchParams.get('type') as 'task' | 'note' | 'reasoningLine') || 'note';
  const notebookId = searchParams.get('notebookId');

  const allEntries = useStore(state => state.entries);
  const isLoaded = useStore(state => state.isLoaded);
  const { entryService } = useServices();

  const {
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
    handleBack,
    handleDelete
  } = useEntryDetailController({ 
    id, 
    initialType, 
    notebookId,
    allEntries,
    isLoaded,
    entryService,
    onNavigateBack: () => navigate(-1)
  });

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
