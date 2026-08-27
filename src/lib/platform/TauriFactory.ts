import type { PlatformFactory } from './PlatformFactory';
import type { DatabaseAdapter } from '../db/DatabaseAdapter';

export class TauriFactory implements PlatformFactory {
  async createDatabaseAdapter(): Promise<DatabaseAdapter> {
    const { TauriAdapter } = await import('../db/TauriAdapter');
    return new TauriAdapter();
  }
}
