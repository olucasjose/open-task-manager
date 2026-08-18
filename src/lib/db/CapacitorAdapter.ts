import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { DatabaseAdapter } from './DatabaseAdapter';
import type { Entry } from '../../types';

export class CapacitorAdapter implements DatabaseAdapter {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async init(): Promise<void> {
    try {
      this.db = await this.sqlite.createConnection('opentaskmanager', false, 'no-encryption', 1, false);
      await this.db.open();
      
      const schema = `
        CREATE TABLE IF NOT EXISTS entries (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          isCompleted INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER,
          updatedAt INTEGER
        );
      `;
      await this.db.execute(schema);
    } catch (err) {
      console.error('Capacitor SQLite init error', err);
      throw err;
    }
  }

  async getEntries(): Promise<Entry[]> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.query('SELECT * FROM entries ORDER BY createdAt DESC;');
    const rows = result.values || [];
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
    await this.db.run(
      'INSERT INTO entries (id, title, type, isCompleted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [entry.id, entry.title, entry.type, entry.isCompleted ? 1 : 0, entry.createdAt || now, entry.updatedAt || now]
    );
  }

  async updateEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run(
      'UPDATE entries SET title = ?, type = ?, isCompleted = ?, updatedAt = ? WHERE id = ?',
      [entry.title, entry.type, entry.isCompleted ? 1 : 0, Date.now(), entry.id]
    );
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM entries WHERE id = ?', [id]);
  }
}
