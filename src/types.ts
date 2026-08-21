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
}
