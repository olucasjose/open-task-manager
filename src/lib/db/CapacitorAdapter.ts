import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { DatabaseAdapter } from './DatabaseAdapter';
import type { Entry, Notebook } from '../../types';

export class CapacitorAdapter implements DatabaseAdapter {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async init(): Promise<void> {
    try {
      try {
        const isConn = await this.sqlite.isConnection('opentaskmanager', false);
        if (isConn.result) {
          this.db = await this.sqlite.retrieveConnection('opentaskmanager', false);
        } else {
          this.db = await this.sqlite.createConnection('opentaskmanager', false, 'no-encryption', 1, false);
        }
      } catch (e) {
        this.db = await this.sqlite.createConnection('opentaskmanager', false, 'no-encryption', 1, false);
      }
      
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
          updatedAt INTEGER,
          notebookId TEXT,
          trashedAt INTEGER
        );
      `;
      await this.db.execute(schema);

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
        await this.db.execute('ALTER TABLE entries ADD COLUMN content TEXT;');
      } catch (e) {}
      
      try {
        await this.db.execute('ALTER TABLE entries ADD COLUMN metadata TEXT;');
      } catch (e) {}

      try {
        await this.db.execute('ALTER TABLE entries ADD COLUMN notebookId TEXT;');
      } catch (e) {}

      try {
        await this.db.execute('ALTER TABLE entries ADD COLUMN trashedAt INTEGER;');
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
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      notebookId: row.notebookId,
      trashedAt: row.trashedAt
    }));
  }

  async createEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const now = Date.now();
    const query = 'INSERT INTO entries (id, title, type, content, isCompleted, createdAt, updatedAt, metadata, notebookId, trashedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [entry.id, entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, entry.createdAt || now, entry.updatedAt || now, entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null];
    await this.db.run(query, values);
  }

  async updateEntry(entry: Entry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const query = 'UPDATE entries SET title = ?, type = ?, content = ?, isCompleted = ?, updatedAt = ?, metadata = ?, notebookId = ?, trashedAt = ? WHERE id = ?';
    const values = [entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, Date.now(), entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null, entry.id];
    await this.db.run(query, values);
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM entries WHERE id = ?', [id]);
  }

  async getNotebooks(): Promise<Notebook[]> {
    if (!this.db) throw new Error('Database not initialized');
    const res = await this.db.query('SELECT * FROM notebooks ORDER BY createdAt ASC');
    const rows = res.values || [];
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
    const query = 'INSERT INTO notebooks (id, name, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)';
    const values = [notebook.id, notebook.name, notebook.icon, notebook.createdAt || now, notebook.updatedAt || now];
    await this.db.run(query, values);
  }

  async updateNotebook(notebook: Notebook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const query = 'UPDATE notebooks SET name = ?, icon = ?, updatedAt = ? WHERE id = ?';
    const values = [notebook.name, notebook.icon, Date.now(), notebook.id];
    await this.db.run(query, values);
  }

  async deleteNotebook(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM notebooks WHERE id = ?', [id]);
  }

  async deleteNotebookWithCascade(notebookId: string, trashedEntries: Entry[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const set: any[] = [
      {
        statement: 'DELETE FROM notebooks WHERE id = ?',
        values: [notebookId]
      }
    ];
    for (const entry of trashedEntries) {
      set.push({
        statement: 'UPDATE entries SET title = ?, type = ?, content = ?, isCompleted = ?, updatedAt = ?, metadata = ?, notebookId = ?, trashedAt = ? WHERE id = ?',
        values: [entry.title, entry.type, entry.content || '', entry.isCompleted ? 1 : 0, Date.now(), entry.metadata ? JSON.stringify(entry.metadata) : null, entry.notebookId || null, entry.trashedAt || null, entry.id]
      });
    }
    await this.db.executeSet(set);
  }
}
