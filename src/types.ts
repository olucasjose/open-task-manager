export interface Entry {
  id: string;
  title: string;
  type: 'task' | 'note' | 'reasoningLine';
  isCompleted: boolean;
  createdAt?: number;
  updatedAt?: number;
}
