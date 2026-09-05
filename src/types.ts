export interface Notebook {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReasoningLineStage {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export interface Entry {
  id: string;
  title: string;
  type: 'task' | 'note' | 'reasoningLine';
  content?: string;
  isCompleted: boolean;
  createdAt?: number;
  updatedAt?: number;
  metadata?: any;
  notebookId?: string;
  trashedAt?: number;
}

export interface AppSettings {
  requireDeleteConfirm: boolean;
  requireTrashConfirm: boolean;
}
