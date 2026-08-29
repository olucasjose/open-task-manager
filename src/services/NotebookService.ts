import type { DatabaseAdapter } from '../lib/db/DatabaseAdapter';
import type { Notebook, Entry } from '../types';

export class NotebookService {
  private repository: DatabaseAdapter;
  private onDataChanged: () => Promise<void>;
  constructor(repository: DatabaseAdapter, onDataChanged: () => Promise<void>) {
    this.repository = repository;
    this.onDataChanged = onDataChanged;
  }

  async createNotebook(notebook: Notebook): Promise<void> {
    await this.repository.createNotebook(notebook);
    await this.onDataChanged();
  }

  async updateNotebook(notebook: Notebook): Promise<void> {
    await this.repository.updateNotebook(notebook);
    await this.onDataChanged();
  }

  async deleteNotebookWithCascade(notebookId: string, notebookEntries: Entry[]): Promise<void> {
    await Promise.all(
      notebookEntries.map((e) => this.repository.updateEntry({ ...e, trashedAt: Date.now() }))
    );
    await this.repository.deleteNotebook(notebookId);
    await this.onDataChanged();
  }
}
