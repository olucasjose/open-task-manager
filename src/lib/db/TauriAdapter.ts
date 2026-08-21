import Database from '@tauri-apps/plugin-sql';
import type { DatabaseAdapter } from './DatabaseAdapter';
import type { Entry, Notebook } from '../../types';

export class TauriAdapter implements DatabaseAdapter {
  private db: Database | null = null;

  async init(): Promise<void> {
    this.db = await Database.load('sqlite:opentaskmanager.db');
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT,
        metadata TEXT,
        isCompleted INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER,
        updatedAt INTEGER,
        notebookId TEXT,
        trashedAt INTEGER
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        createdAt INTEGER,
        updatedAt INTEGER
      );
    `);
    
    try {
      await this.db.execute('ALTER TABLE entries ADD COLUMN metadata TEXT;');
    } catch (e) {}

    try {
      await this.db.execute('ALTER TABLE entries ADD COLUMN notebookId TEXT;');
    } catch (e) {}

    try {
      await this.db.execute('ALTER TABLE entries ADD COLUMN trashedAt INTEGER;');
    } catch (e) {}
  }

  async getEntries(): Promise<Entry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.select<any[]>('SELECT * FROM entries ORDER BY createdAt DESC');
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      type: row.type as 'task' | 'note' | 'reasoningLine',
      content: row.content,
      isCompleted: row.isCompleted === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      notebookId: row.notebookId,
      trashedAt: row.trashedAt
    }));
  }

  async createEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    await this.db.execute(
      'INSERT INTO entries (id, title, type, content, isCompleted, createdAt, updatedAt, metadata, notebookId, trashedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [entry.id, entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, entry.createdAt || now, entry.updatedAt || now, entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null]
    );
  }

  async updateEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute(
      'UPDATE entries SET title = $1, type = $2, content = $3, isCompleted = $4, updatedAt = $5, metadata = $6, notebookId = $7, trashedAt = $8 WHERE id = $9',
      [entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, Date.now(), entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null, entry.id]
    );
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('DELETE FROM entries WHERE id = $1', [id]);
  }

  async getNotebooks(): Promise<Notebook[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.select<any[]>('SELECT * FROM notebooks ORDER BY createdAt ASC');
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async createNotebook(notebook: Notebook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    await this.db.execute(
      'INSERT INTO notebooks (id, name, icon, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5)',
      [notebook.id, notebook.name, notebook.icon, notebook.createdAt || now, notebook.updatedAt || now]
    );
  }

  async updateNotebook(notebook: Notebook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute(
      'UPDATE notebooks SET name = $1, icon = $2, updatedAt = $3 WHERE id = $4',
      [notebook.name, notebook.icon, Date.now(), notebook.id]
    );
  }

  async deleteNotebook(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('DELETE FROM notebooks WHERE id = $1', [id]);
  }
}
