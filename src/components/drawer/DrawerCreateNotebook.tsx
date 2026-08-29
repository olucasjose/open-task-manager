import { useState } from 'react';
import { Folder, Check, X, Plus } from 'lucide-react';
import type { Notebook } from '../../types';
import { useServices } from '../../hooks/useServices';

interface DrawerCreateNotebookProps {
  onCreated?: () => void;
}

export function DrawerCreateNotebook({ onCreated }: DrawerCreateNotebookProps) {
  const { notebookService } = useServices();
  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      setIsCreating(false);
      return;
    }
    try {
      const newNotebook: Notebook = {
        id: Date.now().toString(),
        name: newNotebookName.trim(),
        icon: 'Book',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await notebookService.createNotebook(newNotebook);
      setNewNotebookName('');
      setIsCreating(false);
      onCreated?.();
    } catch (err) {
      console.error('Erro ao criar caderno', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateNotebook();
    if (e.key === 'Escape') setIsCreating(false);
  };

  if (isCreating) {
    return (
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
        <button 
          onClick={handleCreateNotebook} 
          className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md shrink-0 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsCreating(false)} 
          className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full text-left"
    >
      <Plus className="w-5 h-5" />
      Novo Caderno
    </button>
  );
}
