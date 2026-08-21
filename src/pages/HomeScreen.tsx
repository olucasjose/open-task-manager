import { useState, useEffect } from 'react';
import { BookOpen, CheckSquare, FileText, Map, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import type { Entry } from '../types';

export function HomeScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDb = async () => {
      try {
        await db.init();
        const data = await db.getEntries();
        setEntries(data);
      } catch (e: any) {
        console.error('DB Init Error:', e);
        alert(`DB Init Error: ${e?.message || JSON.stringify(e)}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadDb();

    // Listener for updates from EntryDetailScreen
    const handleUpdate = () => loadDb();
    window.addEventListener('entries-updated', handleUpdate);
    return () => window.removeEventListener('entries-updated', handleUpdate);
  }, []);

  const handleCreate = (type: 'task' | 'note' | 'reasoningLine') => {
    setIsFabMenuOpen(false);
    navigate(`/entry/new?type=${type}`);
  };

  const toggleTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const target = entries.find(en => en.id === id);
      if (!target) return;
      const updated = { ...target, isCompleted: !target.isCompleted };
      await db.updateEntry(updated);
      setEntries(await db.getEntries());
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao atualizar item: ${err?.message || JSON.stringify(err)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors font-sans">
      
      {/* Top App Bar Simples */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            Open Task Manager
          </h1>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto pb-24">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
            <p className="text-gray-500 dark:text-gray-400">Iniciando banco de dados...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Tudo limpo por aqui!</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Você ainda não tem tarefas ou anotações neste caderno.
            </p>
          </div>
        ) : (
          <div className="flex flex-col bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors mt-2">
            {entries.map(entry => (
              <div 
                key={entry.id}
                onClick={() => navigate(`/entry/${entry.id}`)}
                className="flex items-start gap-4 p-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                {/* Ícone / Checkbox */}
                <div className="mt-0.5 shrink-0">
                  {entry.type === 'task' ? (
                    <button 
                      onClick={(e) => toggleTask(e, entry.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        entry.isCompleted 
                          ? 'bg-indigo-500 border-indigo-500 text-white' 
                          : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-indigo-400'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  ) : entry.type === 'reasoningLine' ? (
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                      <Map className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                {/* Título e Metadados */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-[15px] font-medium truncate transition-all ${
                    entry.isCompleted 
                      ? 'text-gray-400 dark:text-gray-600 line-through' 
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {entry.title || <span className="text-gray-400 italic">Sem título</span>}
                  </h3>
                  {entry.type === 'note' && (
                    <span className="inline-block mt-1 text-[11px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Anotação
                    </span>
                  )}
                  {entry.type === 'task' && (
                    <span className="inline-block mt-1 text-[11px] font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Tarefa
                    </span>
                  )}
                  {entry.type === 'reasoningLine' && (
                    <span className="inline-block mt-1 text-[11px] font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      Linha de Raciocínio
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB Overlay (escurece o fundo) */}
      {isFabMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20" 
          onClick={() => setIsFabMenuOpen(false)}
        />
      )}

      {/* FAB Menu */}
      <div className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3">
        {isFabMenuOpen && (
          <div className="flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button 
              onClick={() => handleCreate('note')}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-95 transition-all"
            >
              <span>Nova Anotação</span>
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
            </button>
            <button 
              onClick={() => handleCreate('task')}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-95 transition-all"
            >
              <span>Nova Tarefa</span>
              <div className="w-10 h-10 bg-indigo-50 dark:bg-amber-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-amber-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </button>
            <button 
              onClick={() => handleCreate('reasoningLine')}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-95 transition-all"
            >
              <span>Nova Linha de Raciocínio</span>
              <div className="w-10 h-10 bg-indigo-50 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-emerald-400">
                <Map className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

        <button 
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className="w-14 h-14 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95"
        >
          <Plus className={`w-6 h-6 transition-transform duration-300 ${isFabMenuOpen ? "rotate-45" : ""}`} />
        </button>
      </div>
    </div>
  );
}
