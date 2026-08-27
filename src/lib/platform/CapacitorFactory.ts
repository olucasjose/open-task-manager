import type { PlatformFactory } from './PlatformFactory';
import type { DatabaseAdapter } from '../db/DatabaseAdapter';

export class CapacitorFactory implements PlatformFactory {
  async createDatabaseAdapter(): Promise<DatabaseAdapter> {
    const { CapacitorAdapter } = await import('../db/CapacitorAdapter');
    return new CapacitorAdapter();
  }
}
