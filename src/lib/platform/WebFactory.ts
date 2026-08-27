import type { PlatformFactory } from './PlatformFactory';
import type { DatabaseAdapter } from '../db/DatabaseAdapter';

export class WebFactory implements PlatformFactory {
  async createDatabaseAdapter(): Promise<DatabaseAdapter> {
    const { WebAdapter } = await import('../db/WebAdapter');
    return new WebAdapter();
  }
}
