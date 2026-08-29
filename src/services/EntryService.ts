import type { DatabaseAdapter } from '../lib/db/DatabaseAdapter';
import type { Entry } from '../types';

export class EntryService {
  private repository: DatabaseAdapter;
  private onDataChanged: () => Promise<void>;
  constructor(repository: DatabaseAdapter, onDataChanged: () => Promise<void>) {
    this.repository = repository;
    this.onDataChanged = onDataChanged;
  }

  async createEntry(entry: Entry): Promise<void> {
    await this.repository.createEntry(entry);
    await this.onDataChanged();
  }

  async updateEntry(entry: Entry): Promise<void> {
    await this.repository.updateEntry(entry);
    await this.onDataChanged();
  }

  async moveToTrash(entry: Entry): Promise<void> {
    await this.repository.updateEntry({ ...entry, trashedAt: Date.now() });
    await this.onDataChanged();
  }

  async deleteEntry(id: string): Promise<void> {
    await this.repository.deleteEntry(id);
    await this.onDataChanged();
  }

  async restoreEntry(entry: Entry): Promise<void> {
    await this.repository.updateEntry({ ...entry, trashedAt: undefined });
    await this.onDataChanged();
  }

  async emptyTrash(entries: Entry[]): Promise<void> {
    await Promise.all(entries.map((e) => this.repository.deleteEntry(e.id)));
    await this.onDataChanged();
  }
}
