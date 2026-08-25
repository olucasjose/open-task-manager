import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, Inbox, Trash2, Folder, Plus, X, Check, MoreVertical, Edit2, ChevronRight, ChevronDown, FileText, Map } from 'lucide-react';
import { db } from '../lib/db';
import type { Notebook, Entry } from '../types';

interface AppDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppDrawer({ isOpen = false, onClose }: AppDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        await db.init();
        const n = await db.getNotebooks();
        const e = await db.getEntries();
        setNotebooks(n);
        setAllEntries(e);
      } catch (err) {
        console.error('Erro ao carregar dados do Drawer', err);
      }
    };
    
    loadData();
    
    const handleUpdate = () => loadData();
    window.addEventListener('entries-updated', handleUpdate);
    window.addEventListener('notebooks-updated', handleUpdate);
    return () => {
      window.removeEventListener('entries-updated', handleUpdate);
      window.removeEventListener('notebooks-updated', handleUpdate);
    };
  }, []);

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      setIsCreating(false);
      return;
    }
    try {
      const nb: Notebook = {
        id: Date.now().toString(),
        name: newNotebookName.trim(),
        icon: 'Book', // Fixed icon per plan
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.createNotebook(nb);
      setNewNotebookName('');
      setIsCreating(false);
      window.dispatchEvent(new Event('notebooks-updated'));
    } catch (err) {
      console.error('Erro ao criar caderno', err);
    }
  };

  const toggleNotebook = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSet = new Set(expandedNotebooks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNotebooks(newSet);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateNotebook();
    if (e.key === 'Escape') setIsCreating(false);
  };

  // Close drawer on mobile when navigating
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
    setActiveMenuId(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Click outside to close context menu
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden backdrop-blur-sm ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <aside 
        className={`fixed top-0 left-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${!isOpen ? "-translate-x-full" : "translate-x-0 shadow-2xl"} md:translate-x-0 md:sticky md:flex md:w-64 md:shadow-none`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <Link
            to="/notebook/all"
            draggable={false}
            className={`flex items-center gap-2 px-2 py-3 rounded-lg font-medium transition-colors group ${location.pathname === '/notebook/all' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
          >
            <div className="w-6 h-6 shrink-0" />
            <Inbox className="w-5 h-5 shrink-0" />
            <span className="flex-1 truncate">Todos os Itens</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Meus Cadernos
            </h3>
            <div className="space-y-1">

              {notebooks.map((notebook) => {
                const path = `/notebook/${notebook.id}`;
                const isActive = location.pathname === path;
                const isMenuOpen = activeMenuId === notebook.id;
                const isEditing = editingId === notebook.id;

                if (isEditing) {
                  return (
                    <div key={notebook.id} className="flex items-center gap-2 px-3 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-colors">
                      <Book className="w-5 h-5 text-indigo-400 dark:text-indigo-500 shrink-0" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && editName.trim()) {
                            await db.updateNotebook({ ...notebook, name: editName });
                            setEditingId(null);
                            window.dispatchEvent(new Event('notebooks-updated'));
                          }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        placeholder="Novo nome..."
                        className="flex-1 bg-transparent outline-none text-sm font-medium text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 min-w-0"
                      />
                      <button onClick={async () => {
                        if (editName.trim()) {
                          await db.updateNotebook({ ...notebook, name: editName });
                          setEditingId(null);
                          window.dispatchEvent(new Event('notebooks-updated'));
                        }
                      }} className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md shrink-0 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md shrink-0 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                }
                
                const isExpanded = expandedNotebooks.has(notebook.id);
                const notebookEntries = allEntries.filter(e => e.notebookId === notebook.id && !e.trashedAt);
                
                return (
                  <div key={notebook.id} className="flex flex-col gap-1">
                    <Link
                      to={path}
                      draggable={false}
                      className={`flex items-center gap-2 px-2 py-3 rounded-lg font-medium transition-colors group ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                    >
                      <button 
                        onClick={(e) => toggleNotebook(e, notebook.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      
                      <Book className="w-5 h-5 shrink-0" />
                      <span className="flex-1 truncate">{notebook.name}</span>
                    
                      {isActive && (
                        <div className="relative shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : notebook.id); 
                            }} 
                            className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors text-indigo-600 dark:text-indigo-400"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                             <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                               <button 
                                 onClick={(e) => { 
                                   e.preventDefault(); 
                                   e.stopPropagation();
                                   setEditingId(notebook.id); 
                                   setEditName(notebook.name); 
                                   setActiveMenuId(null); 
                                 }} 
                                 className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                               >
                                 <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-500" /> Renomear
                               </button>
                               <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                               <button 
                                 onClick={async (e) => { 
                                   e.preventDefault(); 
                                   e.stopPropagation();
                                   setActiveMenuId(null);
                                   if(window.confirm(`Tem certeza que deseja excluir "${notebook.name}" e enviar seus itens para a lixeira?`)) {
                                     // Delete notebook
                                     await db.deleteNotebook(notebook.id);
                                     // Send child entries to trash
                                     for (const entry of notebookEntries) {
                                       await db.updateEntry({ ...entry, notebookId: undefined, trashedAt: Date.now() });
                                     }
                                     window.dispatchEvent(new Event('notebooks-updated'));
                                     window.dispatchEvent(new Event('entries-updated'));
                                     navigate('/notebook/all');
                                   }
                                 }} 
                                 className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                               >
                                 <Trash2 className="w-4 h-4 text-red-500/80" /> Excluir
                               </button>
                             </div>
                          )}
                        </div>
                      )}
                    </Link>

                    {isExpanded && notebookEntries.length > 0 && (
                      <div className="flex flex-col pl-11 pr-2 space-y-1 mb-2 border-l-2 border-gray-100 dark:border-gray-800 ml-4">
                        {notebookEntries.map(entry => {
                          const isEntryActive = location.pathname === `/entry/${entry.id}`;
                          
                          return (
                            <Link
                              key={entry.id}
                              to={`/entry/${entry.id}`}
                              draggable={false}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isEntryActive ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                              <div className="shrink-0 flex items-center justify-center">
                                {entry.type === 'task' ? (
                                  <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${entry.isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-400 dark:border-gray-500 text-transparent'}`}>
                                    <Check className="w-2.5 h-2.5" />
                                  </div>
                                ) : entry.type === 'reasoningLine' ? (
                                  <Map className="w-4 h-4 text-emerald-500 opacity-90" />
                                ) : (
                                  <FileText className="w-4 h-4 text-indigo-400 opacity-90" />
                                )}
                              </div>
                              <span className="truncate">{entry.title || (entry.type === 'task' ? 'Nova Tarefa' : entry.type === 'reasoningLine' ? 'Nova Linha de Raciocínio' : 'Nova Anotação')}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    {isExpanded && notebookEntries.length === 0 && (
                      <div className="pl-11 pr-2 py-2 mb-2 ml-4 border-l-2 border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 italic">
                        Caderno vazio
                      </div>
                    )}
                  </div>
                );
              })}

              {isCreating ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-colors">
                  <Folder className="w-5 h-5 text-indigo-400 dark:text-indigo-500 shrink-0" />
                  <input
                    type="text"
                    value={newNotebookName}
                    onChange={(e) => setNewNotebookName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    placeholder="Nome do caderno..."
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 min-w-0"
                  />
                  <button onClick={handleCreateNotebook} className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md shrink-0 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsCreating(false)} className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md shrink-0 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full text-left"
                >
                  <Plus className="w-5 h-5" />
                  Novo Caderno
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 transition-colors" />

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Sistema
            </h3>
            <div className="space-y-1">
              <Link
                to="/trash"
                draggable={false}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === '/trash' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
              >
                <Trash2 className="w-5 h-5" />
                Lixeira
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
