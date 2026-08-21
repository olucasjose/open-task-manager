import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { TopAppBar } from '../components/TopAppBar';
import { Edit2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import { ReasoningLineEditor } from '../components/ReasoningLineEditor';
import { db } from '../lib/db';
import type { Entry } from '../types';

export function EntryDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isNew = id === 'new';
  const initialType = (searchParams.get('type') as 'task' | 'note' | 'reasoningLine') || 'note';
  const isReasoningLine = initialType === 'reasoningLine';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(isNew);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState<any>(isReasoningLine ? { stages: [] } : null);

  useEffect(() => {
    if (isNew) return;
    
    const fetchEntry = async () => {
      try {
        await db.init();
        const entries = await db.getEntries();
        const target = entries.find(e => e.id === id);
        if (target) {
          setEntry(target);
          setTitle(target.title || '');
          setContent(target.content || '');
          setMetadata(target.metadata || (target.type === 'reasoningLine' ? { stages: [] } : null));
        }
      } catch (error) {
        console.error('Erro ao buscar entrada:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntry();
  }, [id, isNew]);

  const saveEntry = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      if (isNew) {
        const newEntry: Entry = {
          id: Date.now().toString(),
          type: initialType,
          title: title || (initialType === 'task' ? 'Nova Tarefa' : initialType === 'reasoningLine' ? 'Nova Linha de Raciocínio' : 'Nova Anotação'),
          content,
          metadata,
          isCompleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.createEntry(newEntry);
        window.dispatchEvent(new Event('entries-updated'));
      } else {
        if (!entry) return;
        const updatedEntry: Entry = {
          ...entry,
          title: title || (entry.type === 'task' ? 'Nova Tarefa' : entry.type === 'reasoningLine' ? 'Nova Linha de Raciocínio' : 'Nova Anotação'),
          content,
          metadata,
          updatedAt: Date.now()
        };
        await db.updateEntry(updatedEntry);
        setEntry(updatedEntry);
        window.dispatchEvent(new Event('entries-updated'));
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
    if (isNew) return;
    const confirm = window.confirm(`Deseja enviar este item para a lixeira?`);
    if (!confirm) return;

    try {
      if (id) {
        await db.deleteEntry(id);
        window.dispatchEvent(new Event('entries-updated'));
        navigate(-1);
      }
    } catch (error) {
      console.error('Erro ao deletar entrada:', error);
      alert('Erro ao deletar');
    }
  };

  const currentType = entry?.type || initialType;
  const typeLabel = currentType === 'task' ? 'Tarefa' : currentType === 'reasoningLine' ? 'Linha de Raciocínio' : 'Anotação';

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
              <TextareaAutosize
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Título da ${typeLabel.toLowerCase()}`}
                autoFocus={isNew}
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent outline-none resize-none break-words"
              />
              {currentType === 'reasoningLine' ? (
                <ReasoningLineEditor 
                  stages={metadata?.stages || []}
                  onChange={(stages) => setMetadata({ ...metadata, stages })}
                  isEditing={true}
                />
              ) : (
                <TextareaAutosize
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={typeLabel === 'Tarefa' ? "Adicione uma descrição..." : "Comece a escrever..."}
                  minRows={15}
                  className="text-lg text-gray-700 dark:text-gray-300 bg-transparent outline-none resize-none leading-relaxed break-words"
                />
              )}
            </div>

            {/* PAINEL PREVIEW (Direita) */}
            <div className={`flex-1 flex-col p-6 overflow-y-auto pb-24 md:pb-6 ${!isEditing ? 'flex' : 'hidden md:flex'} md:w-1/2 transition-all bg-gray-50/30 dark:bg-gray-900/10`}>
              {entry || isNew ? (
                <div className="flex flex-col">
                  <h1 className={`text-2xl font-bold mb-6 break-words md:hidden ${entry?.isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                    {title || <span className="text-gray-400 italic">Sem título</span>}
                  </h1>
                  {currentType === 'reasoningLine' ? (
                    <ReasoningLineEditor 
                      stages={metadata?.stages || []}
                      onChange={(stages) => setMetadata({ ...metadata, stages })}
                      isEditing={false}
                    />
                  ) : (
                    <>
                      {content && (
                        <div className="prose prose-indigo dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 break-words mb-8 transition-colors">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {!content && (
                        <p className="text-gray-400 dark:text-gray-500 italic mt-4">A pré-visualização aparecerá aqui.</p>
                      )}
                    </>
                  )}
                </div>
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
