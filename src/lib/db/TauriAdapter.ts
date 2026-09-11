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
        trashedAt INTEGER,
        deleted INTEGER DEFAULT 0,
        syncedAt INTEGER DEFAULT 0
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        createdAt INTEGER,
        updatedAt INTEGER,
        deleted INTEGER DEFAULT 0,
        syncedAt INTEGER DEFAULT 0
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

    try {
      await this.db.execute('ALTER TABLE entries ADD COLUMN deleted INTEGER DEFAULT 0;');
    } catch (e) {}

    try {
      await this.db.execute('ALTER TABLE entries ADD COLUMN syncedAt INTEGER DEFAULT 0;');
    } catch (e) {}

    try {
      await this.db.execute('ALTER TABLE notebooks ADD COLUMN deleted INTEGER DEFAULT 0;');
    } catch (e) {}

    try {
      await this.db.execute('ALTER TABLE notebooks ADD COLUMN syncedAt INTEGER DEFAULT 0;');
    } catch (e) {}
  }

  async getEntries(includeDeleted = false): Promise<Entry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const query = includeDeleted ? 'SELECT * FROM entries ORDER BY createdAt DESC' : 'SELECT * FROM entries WHERE deleted = 0 ORDER BY createdAt DESC';
    const rows = await this.db.select<any[]>(query);
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
      trashedAt: row.trashedAt,
      deleted: row.deleted === 1,
      syncedAt: row.syncedAt
    }));
  }

  async createEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    await this.db.execute(
      'INSERT INTO entries (id, title, type, content, isCompleted, createdAt, updatedAt, metadata, notebookId, trashedAt, deleted, syncedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [entry.id, entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, entry.createdAt || now, entry.updatedAt || now, entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null, entry.deleted ? 1 : 0, entry.syncedAt || 0]
    );
  }

  async updateEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute(
      'UPDATE entries SET title = $1, type = $2, content = $3, isCompleted = $4, updatedAt = $5, metadata = $6, notebookId = $7, trashedAt = $8, deleted = $9, syncedAt = $10 WHERE id = $11',
      [entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, Date.now(), entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null, entry.deleted ? 1 : 0, entry.syncedAt || 0, entry.id]
    );
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('UPDATE entries SET deleted = 1, updatedAt = $1 WHERE id = $2', [Date.now(), id]);
  }

  async getNotebooks(includeDeleted = false): Promise<Notebook[]> {
    if (!this.db) throw new Error('Database not initialized');
    const query = includeDeleted ? 'SELECT * FROM notebooks ORDER BY createdAt ASC' : 'SELECT * FROM notebooks WHERE deleted = 0 ORDER BY createdAt ASC';
    const rows = await this.db.select<any[]>(query);
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deleted: row.deleted === 1,
      syncedAt: row.syncedAt
    }));
  }

  async createNotebook(notebook: Notebook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    await this.db.execute(
      'INSERT INTO notebooks (id, name, icon, createdAt, updatedAt, deleted, syncedAt) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [notebook.id, notebook.name, notebook.icon, notebook.createdAt || now, notebook.updatedAt || now, notebook.deleted ? 1 : 0, notebook.syncedAt || 0]
    );
  }

  async updateNotebook(notebook: Notebook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute(
      'UPDATE notebooks SET name = $1, icon = $2, updatedAt = $3, deleted = $4, syncedAt = $5 WHERE id = $6',
      [notebook.name, notebook.icon, Date.now(), notebook.deleted ? 1 : 0, notebook.syncedAt || 0, notebook.id]
    );
  }

  async deleteNotebook(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('UPDATE notebooks SET deleted = 1, updatedAt = $1 WHERE id = $2', [Date.now(), id]);
  }

  async deleteNotebookWithCascade(notebookId: string, trashedEntries: Entry[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('BEGIN TRANSACTION;');
    try {
      await this.db.execute('UPDATE notebooks SET deleted = 1, updatedAt = $1 WHERE id = $2', [Date.now(), notebookId]);
      for (const entry of trashedEntries) {
        await this.db.execute(
          'UPDATE entries SET title = $1, type = $2, content = $3, isCompleted = $4, updatedAt = $5, metadata = $6, notebookId = $7, trashedAt = $8 WHERE id = $9',
          [entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, Date.now(), entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null, entry.id]
        );
      }
      await this.db.execute('COMMIT;');
    } catch (e) {
      await this.db.execute('ROLLBACK;');
      throw e;
    }
  }
}
