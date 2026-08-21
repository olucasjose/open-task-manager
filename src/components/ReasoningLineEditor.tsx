import { useState } from 'react';
import type { ReasoningLineStage } from '../types';
import { Plus, X, Check, GripVertical } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface ReasoningLineEditorProps {
  stages: ReasoningLineStage[];
  onChange: (stages: ReasoningLineStage[]) => void;
  isEditing: boolean;
}

export function ReasoningLineEditor({ stages, onChange, isEditing }: ReasoningLineEditorProps) {
  const [newStageTitle, setNewStageTitle] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditing) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(id);
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    if (dragOverId === id) {
      setDragOverId(null);
      setDropPosition(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    setDropPosition(y < rect.height / 2 ? 'before' : 'after');
    
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    const currentDropPos = dropPosition;
    setDragOverId(null);
    setDropPosition(null);
    
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
    
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      return;
    }
    
    const newStages = [...stages];
    const draggedIndex = newStages.findIndex(s => s.id === sourceId);
    if (draggedIndex === -1) {
      setDraggedId(null);
      return;
    }
    
    const [draggedItem] = newStages.splice(draggedIndex, 1);
    
    let newTargetIndex = newStages.findIndex(s => s.id === targetId);
    if (newTargetIndex === -1) {
      setDraggedId(null);
      return;
    }
    
    if (currentDropPos === 'after') {
      newTargetIndex += 1;
    }
    
    newStages.splice(newTargetIndex, 0, draggedItem);
    
    onChange(newStages);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleAddStage = () => {
    if (!newStageTitle.trim()) return;
    const newStage: ReasoningLineStage = {
      id: Date.now().toString(),
      title: newStageTitle.trim(),
      isCompleted: false,
    };
    onChange([...stages, newStage]);
    setNewStageTitle('');
  };

  const handleToggleCompletion = (id: string) => {
    if (isEditing) return; 
    onChange(stages.map(s => 
      s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
    ));
  };

  const handleDeleteStage = (id: string) => {
    onChange(stages.filter(s => s.id !== id));
  };

  const handleUpdateStageTitle = (id: string, newTitle: string) => {
    onChange(stages.map(s => 
      s.id === id ? { ...s, title: newTitle } : s
    ));
  };

  return (
    <div className="flex flex-col w-full py-8 max-w-2xl mx-auto">
      {stages.length === 0 && !isEditing ? (
        <p className="text-gray-400 dark:text-gray-500 italic text-center">Nenhum estágio nesta linha de raciocínio.</p>
      ) : (
        <div className="flex flex-col w-full relative">
          
          {/* Layout Vertical Contínuo */}
          <div className="flex flex-col gap-8 relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 ml-4 transition-colors">
            {stages.map((stage) => (
              <div 
                key={stage.id} 
                className={`relative flex flex-col gap-2 transition-all duration-200 ${isEditing && draggedId === stage.id ? "opacity-50 scale-95" : ""}`}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, stage.id)}
                onDragEnter={(e) => handleDragEnter(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Indicadores de Drop */}
                {isEditing && dragOverId === stage.id && dropPosition === 'before' && (
                  <div className="absolute -top-4 left-0 right-0 h-[3px] bg-indigo-500 rounded-full z-50 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                {isEditing && dragOverId === stage.id && dropPosition === 'after' && (
                  <div className="absolute -bottom-4 left-0 right-0 h-[3px] bg-indigo-500 rounded-full z-50 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                
                {/* O Nó (Bolinha) */}
                <button
                  onClick={() => handleToggleCompletion(stage.id)}
                  disabled={isEditing}
                  className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white dark:bg-gray-900 ${
                    stage.isCompleted ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-gray-300 dark:border-gray-600"
                  } ${!isEditing ? "hover:scale-110 cursor-pointer" : ""}`}
                >
                  {stage.isCompleted && <Check className="w-4 h-4" />}
                </button>
                
                {/* Conteúdo */}
                {isEditing ? (
                  <div className={`flex items-start gap-2 bg-white dark:bg-gray-800 border rounded-xl p-3 shadow-sm transition-all border-gray-100 dark:border-gray-700 ${draggedId ? "pointer-events-none" : ""}`}>
                    <div className="flex items-center justify-center pt-[2px] cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 pointer-events-auto touch-none">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <TextareaAutosize
                      value={stage.title}
                      onChange={(e) => handleUpdateStageTitle(stage.id, e.target.value)}
                      className="flex-1 bg-transparent resize-none outline-none font-medium text-gray-800 dark:text-gray-100 pointer-events-auto"
                    />
                    <button onClick={() => handleDeleteStage(stage.id)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors pointer-events-auto">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className={`transition-opacity ${stage.isCompleted ? "opacity-60" : ""}`}>
                    <h4 className={`font-bold text-lg ${stage.isCompleted ? "text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"}`}>
                      {stage.title}
                    </h4>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Input para adicionar novo estágio */}
      {isEditing && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 w-full transition-colors">
          <input
            type="text"
            value={newStageTitle}
            onChange={(e) => setNewStageTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
            placeholder="Nome do novo estágio..."
            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 dark:text-gray-100"
          />
          <button 
            onClick={handleAddStage}
            className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white p-3 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
