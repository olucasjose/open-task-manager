import type { Entry, Notebook } from '../../types';

export interface DatabaseAdapter {
  /**
   * Initializes the database connection and creates tables if they do not exist.
   */
  init(): Promise<void>;

  /**
   * Retrieves all entries from the database, ordered by creation date descending.
   */
  getEntries(): Promise<Entry[]>;

  /**
   * Inserts a new entry into the database.
   */
  createEntry(entry: Entry): Promise<void>;

  /**
   * Updates an existing entry (e.g. toggling completion status).
   */
  updateEntry(entry: Entry): Promise<void>;

  /**
   * Deletes an entry by its ID.
   */
  deleteEntry(id: string): Promise<void>;

  /**
   * Retrieves all notebooks from the database.
   */
  getNotebooks(): Promise<Notebook[]>;

  /**
   * Inserts a new notebook into the database.
   */
  createNotebook(notebook: Notebook): Promise<void>;

  /**
   * Updates an existing notebook.
   */
  updateNotebook(notebook: Notebook): Promise<void>;

  /**
   * Deletes a notebook by its ID.
   */
  deleteNotebook(id: string): Promise<void>;
}
