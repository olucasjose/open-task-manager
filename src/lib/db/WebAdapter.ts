import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { DatabaseAdapter } from './DatabaseAdapter';
import type { Entry, Notebook } from '../../types';

export class WebAdapter implements DatabaseAdapter {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    this.db = await openDB('opentaskmanager_db', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('entries')) {
          db.createObjectStore('entries', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('notebooks')) {
          db.createObjectStore('notebooks', { keyPath: 'id' });
        }
      },
    });
  }

  async getEntries(): Promise<Entry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const all = await this.db.getAll('entries');
    return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  async createEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    await this.db.put('entries', { 
      ...entry, 
      createdAt: entry.createdAt || now, 
      updatedAt: entry.updatedAt || now 
    });
  }

  async updateEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('entries', { ...entry, updatedAt: Date.now() });
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('entries', id);
  }

  async getNotebooks(): Promise<Notebook[]> {
    if (!this.db) throw new Error('Database not initialized');
    const all = await this.db.getAll('notebooks');
    return all.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }

  async createNotebook(notebook: Notebook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    await this.db.put('notebooks', { 
      ...notebook, 
      createdAt: notebook.createdAt || now, 
      updatedAt: notebook.updatedAt || now 
    });
  }

  async updateNotebook(notebook: Notebook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('notebooks', { ...notebook, updatedAt: Date.now() });
  }

  async deleteNotebook(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('notebooks', id);
  }
}
