import type { DatabaseAdapter } from '../lib/db/DatabaseAdapter';
import type { Entry } from '../types';

export class EntryService {
  private repository: DatabaseAdapter;

  constructor(repository: DatabaseAdapter) {
    this.repository = repository;
  }

  async createEntry(entry: Entry): Promise<Entry> {
    await this.repository.createEntry(entry);
    return entry;
  }

  async updateEntry(entry: Entry): Promise<Entry> {
    await this.repository.updateEntry(entry);
    return entry;
  }

  async moveToTrash(entry: Entry): Promise<Entry> {
    const trashedEntry = { ...entry, trashedAt: Date.now() };
    await this.repository.updateEntry(trashedEntry);
    return trashedEntry;
  }

  async deleteEntry(id: string): Promise<string> {
    await this.repository.deleteEntry(id);
    return id;
  }

  async restoreEntry(entry: Entry): Promise<Entry> {
    const restoredEntry = { ...entry, trashedAt: undefined };
    await this.repository.updateEntry(restoredEntry);
    return restoredEntry;
  }

  async emptyTrash(entries: Entry[]): Promise<string[]> {
    await Promise.all(entries.map((e) => this.repository.deleteEntry(e.id)));
    return entries.map(e => e.id);
  }
}
