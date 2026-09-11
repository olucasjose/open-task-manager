export interface Notebook {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  deleted?: boolean;
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
  syncedAt?: number;
  deleted?: boolean;
}

export interface AppSettings {
  requireDeleteConfirm: boolean;
  requireTrashConfirm: boolean;
}

export interface SyncState {
  provider: 'dropbox' | 'local' | null;
  dropboxRefreshToken?: string;
  lastSync?: number;
}

export interface SyncConflict {
  id: string;
  type: 'notebook' | 'entry';
  name: string;
  localUpdated: number;
  cloudUpdated: number;
}

export interface SyncResult {
  success: boolean;
  conflicts?: SyncConflict[];
  pushed?: number;
  pulled?: number;
  deletedLocal?: number;
  error?: string;
}
