import { BookOpen, Plus, Menu } from 'lucide-react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ENTRY_STRATEGIES } from '../registry/EntryRegistry';
import { useHomeController } from '../controllers/useHomeController';

export function HomeScreen() {
  const { id: notebookId } = useParams();
  const navigate = useNavigate();
  const { openDrawer } = useOutletContext<{ openDrawer: () => void }>();

  const {
    isLoaded,
    isFabMenuOpen,
    setIsFabMenuOpen,
    visibleEntries,
    notebookName,
    handleCreate,
    toggleTask,
  } = useHomeController(notebookId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors font-sans">
      
      {/* Top App Bar Simples */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={openDrawer}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {notebookName}
          </h1>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto pb-24">
        {!isLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Carregando...</p>
          </div>
        ) : visibleEntries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Tudo limpo por aqui!</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Você ainda não tem tarefas ou anotações neste caderno.
            </p>
          </div>
        ) : (
          <div className="flex flex-col bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors mt-2">
            {visibleEntries.map(entry => (
              <div 
                key={entry.id}
                onClick={() => navigate(`/entry/${entry.id}`)}
                className={`group flex items-start gap-3 p-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                  entry.type === 'task' && entry.isCompleted ? 'opacity-75 bg-gray-50/50 dark:bg-gray-950/50' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {ENTRY_STRATEGIES[entry.type]?.renderListIcon(entry, { onClick: (e: React.MouseEvent) => toggleTask(e, entry.id) }) || ENTRY_STRATEGIES.note.renderListIcon(entry)}
                </div>
                
                {/* Título e Metadados */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-[15px] font-medium leading-tight transition-colors break-words ${
                    entry.type === 'task' && entry.isCompleted 
                      ? 'text-gray-400 dark:text-gray-500 line-through' 
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {entry.title || <span className="text-gray-400 italic">Sem título</span>}
                  </h3>
                  
                  {entry.content && entry.type !== 'reasoningLine' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 break-words">
                      {entry.content}
                    </p>
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
            {Object.values(ENTRY_STRATEGIES).map(strategy => (
              <button 
                key={strategy.id}
                onClick={() => handleCreate(strategy.id as 'task' | 'note' | 'reasoningLine')}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-95 transition-all"
              >
                <span>{strategy.fab.label}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${strategy.fab.bgClass} ${strategy.fab.colorClass}`}>
                  {strategy.fab.icon}
                </div>
              </button>
            ))}
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
