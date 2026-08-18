import Database from '@tauri-apps/plugin-sql';
import type { DatabaseAdapter } from './DatabaseAdapter';
import type { Entry } from '../../types';

export class TauriAdapter implements DatabaseAdapter {
  private db: Database | null = null;

  async init(): Promise<void> {
    this.db = await Database.load('sqlite:opentaskmanager.db');
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        isCompleted INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER,
        updatedAt INTEGER
      );
    `);
  }

  async getEntries(): Promise<Entry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const rows = await this.db.select<any[]>('SELECT * FROM entries ORDER BY createdAt DESC');
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      type: row.type as 'task' | 'note' | 'reasoningLine',
      isCompleted: row.isCompleted === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async createEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    await this.db.execute(
      'INSERT INTO entries (id, title, type, isCompleted, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6)',
      [entry.id, entry.title, entry.type, entry.isCompleted ? 1 : 0, entry.createdAt || now, entry.updatedAt || now]
    );
  }

  async updateEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute(
      'UPDATE entries SET title = $1, type = $2, isCompleted = $3, updatedAt = $4 WHERE id = $5',
      [entry.title, entry.type, entry.isCompleted ? 1 : 0, Date.now(), entry.id]
    );
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('DELETE FROM entries WHERE id = $1', [id]);
  }
}
