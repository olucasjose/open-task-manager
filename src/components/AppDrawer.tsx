import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';

import { useStore } from '../store/useStore';
import { useServices } from '../hooks/useServices';
import { useAppDrawerController } from '../controllers/useAppDrawerController';
import { DrawerNotebookItem } from './drawer/DrawerNotebookItem';
import { DrawerCreateNotebook } from './drawer/DrawerCreateNotebook';
import { DrawerSystemMenu } from './drawer/DrawerSystemMenu';

interface AppDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppDrawer({ isOpen = false, onClose }: AppDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const notebooks = useStore(state => state.notebooks);
  const allEntries = useStore(state => state.entries);
  const settings = useStore(state => state.settings);
  const updateNotebook = useStore(state => state.updateNotebook);
  const cascadeDeleteNotebook = useStore(state => state.cascadeDeleteNotebook);
  const { notebookService } = useServices();

  const { handleRenameNotebook, handleDeleteNotebook } = useAppDrawerController({
    notebookService,
    settings,
    onUpdateNotebook: updateNotebook,
    onCascadeDeleteNotebook: cascadeDeleteNotebook,
    onNavigate: navigate
  });

  // Close drawer on mobile when navigating
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);


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

              {notebooks.map(notebook => (
                <DrawerNotebookItem
                  key={notebook.id}
                  notebook={notebook}
                  notebookEntries={allEntries.filter(e => e.notebookId === notebook.id && !e.trashedAt)}
                  onRename={(newName) => handleRenameNotebook(notebook, newName)}
                  onDelete={() => handleDeleteNotebook(notebook, allEntries.filter(e => e.notebookId === notebook.id && !e.trashedAt))}
                />
              ))}

              <DrawerCreateNotebook />
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 transition-colors" />

          <DrawerSystemMenu />
        </nav>
      </aside>
    </>
  );
}
