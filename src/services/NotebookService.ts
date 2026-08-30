import type { DatabaseAdapter } from '../lib/db/DatabaseAdapter';
import type { Notebook, Entry } from '../types';

export class NotebookService {
  private repository: DatabaseAdapter;

  constructor(repository: DatabaseAdapter) {
    this.repository = repository;
  }

  async createNotebook(notebook: Notebook): Promise<Notebook> {
    await this.repository.createNotebook(notebook);
    return notebook;
  }

  async updateNotebook(notebook: Notebook): Promise<Notebook> {
    await this.repository.updateNotebook(notebook);
    return notebook;
  }

  async deleteNotebookWithCascade(notebookId: string, notebookEntries: Entry[]): Promise<{ deletedNotebookId: string, trashedEntries: Entry[] }> {
    const trashedEntries = notebookEntries.map((e) => ({ ...e, trashedAt: Date.now() }));
    await this.repository.deleteNotebookWithCascade(notebookId, trashedEntries);
    return { deletedNotebookId: notebookId, trashedEntries };
  }
}
