import React from 'react';
import { Check, CheckSquare, FileText, Map } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import { ReasoningLineEditor } from '../components/ReasoningLineEditor';
import type { Entry } from '../types';

export interface EntryStrategy {
  id: 'task' | 'note' | 'reasoningLine';
  label: string;
  defaultTitle: string;
  
  // Icon to be displayed in lists
  renderListIcon: (entry: Partial<Entry>, options?: { onClick?: (e: React.MouseEvent) => void }) => React.ReactNode;
  
  // Renders the editor pane
  renderEditor: (props: {
    title: string;
    setTitle: (t: string) => void;
    content: string;
    setContent: (c: string) => void;
    metadata: any;
    setMetadata: (m: any) => void;
    isNew: boolean;
  }) => React.ReactNode;
  
  // Renders the preview pane
  renderPreview: (props: {
    title: string;
    content: string;
    metadata: any;
    isCompleted?: boolean;
  }) => React.ReactNode;
  
  // FAB action config
  fab: {
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
  };
}

export const ENTRY_STRATEGIES: Record<string, EntryStrategy> = {
  note: {
    id: 'note',
    label: 'Anotação',
    defaultTitle: 'Nova Anotação',
    renderListIcon: () => (
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-indigo-400">
        <FileText className="w-5 h-5" />
      </div>
    ),
    renderEditor: ({ title, setTitle, content, setContent, isNew }) => (
      <>
        <TextareaAutosize
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da anotação"
          autoFocus={isNew}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent outline-none resize-none break-words"
        />
        <TextareaAutosize
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comece a escrever..."
          minRows={15}
          className="text-lg text-gray-700 dark:text-gray-300 bg-transparent outline-none resize-none leading-relaxed break-words"
        />
      </>
    ),
    renderPreview: ({ title, content, isCompleted }) => (
      <div className="flex flex-col">
        <h1 className={`text-2xl font-bold mb-6 break-words md:hidden ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
          {title || <span className="text-gray-400 italic">Sem título</span>}
        </h1>
        {content ? (
          <div className="prose prose-indigo dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 break-words mb-8 transition-colors">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 italic mt-4">A pré-visualização aparecerá aqui.</p>
        )}
      </div>
    ),
    fab: {
      label: 'Nova Anotação',
      icon: <FileText className="w-5 h-5" />,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-50 dark:bg-indigo-500/20'
    }
  },

  task: {
    id: 'task',
    label: 'Tarefa',
    defaultTitle: 'Nova Tarefa',
    renderListIcon: (entry, options) => {
      const className = `flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${entry.isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-transparent'}`;
      if (options?.onClick) {
        return (
          <button onClick={options.onClick} className={className}>
            <Check className="w-4 h-4" />
          </button>
        );
      }
      return (
        <div className={className}>
          <Check className="w-4 h-4" />
        </div>
      );
    },
    renderEditor: ({ title, setTitle, content, setContent, isNew }) => (
      <>
        <TextareaAutosize
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da tarefa"
          autoFocus={isNew}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent outline-none resize-none break-words"
        />
        <TextareaAutosize
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Adicione uma descrição..."
          minRows={15}
          className="text-lg text-gray-700 dark:text-gray-300 bg-transparent outline-none resize-none leading-relaxed break-words"
        />
      </>
    ),
    renderPreview: ({ title, content, isCompleted }) => (
      <div className="flex flex-col">
        <h1 className={`text-2xl font-bold mb-6 break-words md:hidden ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
          {title || <span className="text-gray-400 italic">Sem título</span>}
        </h1>
        {content ? (
          <div className="prose prose-indigo dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 break-words mb-8 transition-colors">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 italic mt-4">A pré-visualização aparecerá aqui.</p>
        )}
      </div>
    ),
    fab: {
      label: 'Nova Tarefa',
      icon: <CheckSquare className="w-5 h-5" />,
      colorClass: 'text-indigo-600 dark:text-amber-400',
      bgClass: 'bg-indigo-50 dark:bg-amber-500/20'
    }
  },

  reasoningLine: {
    id: 'reasoningLine',
    label: 'Linha de Raciocínio',
    defaultTitle: 'Nova Linha de Raciocínio',
    renderListIcon: () => (
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-emerald-500">
        <Map className="w-5 h-5" />
      </div>
    ),
    renderEditor: ({ title, setTitle, metadata, setMetadata, isNew }) => (
      <>
        <TextareaAutosize
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da linha de raciocínio"
          autoFocus={isNew}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent outline-none resize-none break-words"
        />
        <ReasoningLineEditor 
          stages={metadata?.stages || []}
          onChange={(stages) => setMetadata({ ...metadata, stages })}
          isEditing={true}
        />
      </>
    ),
    renderPreview: ({ title, metadata, isCompleted }) => (
      <div className="flex flex-col">
        <h1 className={`text-2xl font-bold mb-6 break-words md:hidden ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
          {title || <span className="text-gray-400 italic">Sem título</span>}
        </h1>
        <ReasoningLineEditor 
          stages={metadata?.stages || []}
          onChange={() => {}} // Readonly
          isEditing={false}
        />
      </div>
    ),
    fab: {
      label: 'Nova Linha de Raciocínio',
      icon: <Map className="w-5 h-5" />,
      colorClass: 'text-indigo-600 dark:text-emerald-400',
      bgClass: 'bg-indigo-50 dark:bg-emerald-500/20'
    }
  }
};
