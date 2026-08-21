import { Capacitor } from '@capacitor/core';
import type { DatabaseAdapter } from './DatabaseAdapter';
import { WebAdapter } from './WebAdapter';
import { TauriAdapter } from './TauriAdapter';
import { CapacitorAdapter } from './CapacitorAdapter';
import type { Entry, Notebook } from '../../types';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: Record<string, unknown>;
  }
}

class DatabaseFacade implements DatabaseAdapter {
  private adapter: DatabaseAdapter;
  private initialized = false;

  constructor() {
    if (window.__TAURI_INTERNALS__) {
      console.log('[DB] Using Tauri SQLite Adapter');
      this.adapter = new TauriAdapter();
    } else if (Capacitor.isNativePlatform()) {
      console.log('[DB] Using Capacitor SQLite Adapter');
      this.adapter = new CapacitorAdapter();
    } else {
      console.log('[DB] Using Web IndexedDB Adapter');
      this.adapter = new WebAdapter();
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.adapter.init();
    this.initialized = true;
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
