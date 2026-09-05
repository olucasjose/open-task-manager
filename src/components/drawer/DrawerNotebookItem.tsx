import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, X, Check, MoreVertical, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import type { Notebook, Entry } from '../../types';
import { ENTRY_STRATEGIES } from '../../registry/EntryRegistry';

interface DrawerNotebookItemProps {
  notebook: Notebook;
  notebookEntries: Entry[];
  onRename: (newName: string) => void;
  onDelete: () => void;
}

export function DrawerNotebookItem({ notebook, notebookEntries, onRename, onDelete }: DrawerNotebookItemProps) {
  const location = useLocation();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(notebook.name);

  const path = `/notebook/${notebook.id}`;
  const isActive = location.pathname === path;

  // Fecha o menu de contexto ao clicar fora
  useEffect(() => {
    const handleClick = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      window.addEventListener('click', handleClick);
    }
    return () => window.removeEventListener('click', handleClick);
  }, [isMenuOpen]);

  // Modo de Edição
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-colors">
        <Book className="w-5 h-5 text-indigo-400 dark:text-indigo-500 shrink-0" />
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && editName.trim()) {
              onRename(editName);
              setIsEditing(false);
            }
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
          placeholder="Novo nome..."
          className="flex-1 bg-transparent outline-none text-sm font-medium text-indigo-900 dark:text-indigo-100 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 min-w-0"
        />
        <button 
          onClick={() => {
            if (editName.trim()) {
              onRename(editName);
              setIsEditing(false);
            }
          }} 
          className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md shrink-0 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsEditing(false)} 
          className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Modo de Listagem
  return (
    <div className="flex flex-col gap-1">
      <Link
        to={path}
        draggable={false}
        className={`flex items-center gap-2 px-2 py-3 rounded-lg font-medium transition-colors group ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
      >
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
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
                setIsMenuOpen(!isMenuOpen);
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
                     setIsEditing(true);
                     setEditName(notebook.name);
                     setIsMenuOpen(false);
                   }} 
                   className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                 >
                   <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-500" /> Renomear
                 </button>
                 <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                 <button 
                   onClick={(e) => { 
                     e.preventDefault(); 
                     e.stopPropagation();
                     setIsMenuOpen(false);
                     onDelete();
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

      {/* Sub-itens Expandidos */}
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
                  {ENTRY_STRATEGIES[entry.type]?.renderListIcon(entry) || ENTRY_STRATEGIES.note.renderListIcon(entry)}
                </div>
                <span className="truncate">{entry.title || ENTRY_STRATEGIES[entry.type]?.defaultTitle || 'Sem título'}</span>
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
}
