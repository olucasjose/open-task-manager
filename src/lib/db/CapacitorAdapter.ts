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
          content TEXT,
          metadata TEXT,
          isCompleted INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER,
          updatedAt INTEGER
        );
      `;
      await this.db.execute(schema);
      
      try {
        await this.db.execute('ALTER TABLE entries ADD COLUMN content TEXT;');
      } catch (e) {}
      
      try {
        await this.db.execute('ALTER TABLE entries ADD COLUMN metadata TEXT;');
      } catch (e) {}
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
      content: row.content,
      isCompleted: row.isCompleted === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    }));
  }

  async createEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    const query = 'INSERT INTO entries (id, title, type, content, isCompleted, createdAt, updatedAt, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [entry.id, entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, entry.createdAt || now, entry.updatedAt || now, entry.metadata ? JSON.stringify(entry.metadata) : null];
    await this.db.run(query, values);
  }

  async updateEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const query = 'UPDATE entries SET title = ?, type = ?, content = ?, isCompleted = ?, updatedAt = ?, metadata = ? WHERE id = ?';
    const values = [entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, Date.now(), entry.metadata ? JSON.stringify(entry.metadata) : null, entry.id];
    await this.db.run(query, values);
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM entries WHERE id = ?', [id]);
  }
}
