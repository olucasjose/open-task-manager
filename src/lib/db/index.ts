import type { DatabaseAdapter } from './DatabaseAdapter';
import type { Entry, Notebook } from '../../types';
import { currentPlatform } from '../platform';
class DatabaseFacade implements DatabaseAdapter {
  private adapter!: DatabaseAdapter;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (!this.adapter) {
          this.adapter = await currentPlatform.createDatabaseAdapter();
        }
        await this.adapter.init();
        this.initialized = true;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  async getEntries(): Promise<Entry[]> {
    return this.adapter.getEntries();
  }

  async createEntry(entry: Entry): Promise<void> {
    return this.adapter.createEntry(entry);
  }

  async updateEntry(entry: Entry): Promise<void> {
    return this.adapter.updateEntry(entry);
  }

  async deleteEntry(id: string): Promise<void> {
    return this.adapter.deleteEntry(id);
  }

  async getNotebooks(): Promise<Notebook[]> {
    return this.adapter.getNotebooks();
  }

  async createNotebook(notebook: Notebook): Promise<void> {
    return this.adapter.createNotebook(notebook);
  }

  async updateNotebook(notebook: Notebook): Promise<void> {
    return this.adapter.updateNotebook(notebook);
  }

  async deleteNotebook(id: string): Promise<void> {
    return this.adapter.deleteNotebook(id);
  }
}

export const db = new DatabaseFacade();
