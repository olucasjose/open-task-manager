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

  async getEntries(includeDeleted = false): Promise<Entry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const all = await this.db.getAll('entries');
    return all.filter(e => includeDeleted || !e.deleted).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
    const entry = await this.db.get('entries', id);
    if (entry) {
      await this.db.put('entries', { ...entry, deleted: true, updatedAt: Date.now() });
    }
  }

  async getNotebooks(includeDeleted = false): Promise<Notebook[]> {
    if (!this.db) throw new Error('Database not initialized');
    const all = await this.db.getAll('notebooks');
    return all.filter(n => includeDeleted || !n.deleted).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
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
    const notebook = await this.db.get('notebooks', id);
    if (notebook) {
      await this.db.put('notebooks', { ...notebook, deleted: true, updatedAt: Date.now() });
    }
  }

  async deleteNotebookWithCascade(notebookId: string, trashedEntries: Entry[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction(['notebooks', 'entries'], 'readwrite');
    const notebook = await tx.objectStore('notebooks').get(notebookId);
    if (notebook) {
      await tx.objectStore('notebooks').put({ ...notebook, deleted: true, updatedAt: Date.now() });
    }
    await Promise.all(
      trashedEntries.map(entry => tx.objectStore('entries').put({ ...entry, updatedAt: Date.now() }))
    );
    await tx.done;
  }
}
