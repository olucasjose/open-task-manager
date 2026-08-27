import type { DatabaseAdapter } from '../db/DatabaseAdapter';

export interface PlatformFactory {
  createDatabaseAdapter(): Promise<DatabaseAdapter>;
}
