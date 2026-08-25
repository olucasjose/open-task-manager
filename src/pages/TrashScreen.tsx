import { useState, useEffect } from 'react';
import { Check, FileText, Map, Trash2, RefreshCw, Menu } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { db } from '../lib/db';
import type { Entry } from '../types';

export function TrashScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { openDrawer } = useOutletContext<{ openDrawer: () => void }>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await db.getEntries();
        // Only show trashed entries
        setEntries(data.filter(e => e.trashedAt));
      } catch (e: any) {
        console.error('DB Init Error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('entries-updated', handleUpdate);
    return () => window.removeEventListener('entries-updated', handleUpdate);
  }, []);

  const handleRestore = async (e: React.MouseEvent, entry: Entry) => {
    e.stopPropagation();
    try {
      await db.updateEntry({ ...entry, trashedAt: undefined });
      window.dispatchEvent(new Event('entries-updated'));
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
      await db.deleteEntry(id);
      window.dispatchEvent(new Event('entries-updated'));
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao excluir: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleEmptyTrash = async () => {
    const confirm = window.confirm("Deseja esvaziar a lixeira? Todos os itens serão excluídos permanentemente.");
    if (!confirm) return;
    try {
      for (const entry of entries) {
        await db.deleteEntry(entry.id);
      }
      window.dispatchEvent(new Event('entries-updated'));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors font-sans">
      
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={openDrawer}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            Lixeira
          </h1>
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Esvaziar
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
            <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
            <Trash2 className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Lixeira Vazia</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Os itens que você excluir aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors mt-2">
            {entries.map(entry => (
              <div 
                key={entry.id}
                onClick={() => navigate(`/entry/${entry.id}`)}
                className="group flex items-start gap-3 p-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="mt-0.5 shrink-0">
                  {entry.type === 'task' ? (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center border-gray-300 dark:border-gray-600 text-transparent">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : entry.type === 'reasoningLine' ? (
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-emerald-500">
                      <Map className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-medium leading-tight text-gray-800 dark:text-gray-200 break-words">
                    {entry.title || <span className="text-gray-400 italic">Sem título</span>}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Excluído em: {new Date(entry.trashedAt || 0).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleRestore(e, entry)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Restaurar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleHardDelete(e, entry.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Excluir Definitivamente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
