import type { DatabaseAdapter } from '../lib/db/DatabaseAdapter';
import type { CloudAdapter } from '../lib/cloud/CloudAdapter';
import type { SyncResult, SyncConflict, Notebook, Entry } from '../types';

export class SyncService {
  private db: DatabaseAdapter;
  private cloud: CloudAdapter;

  constructor(db: DatabaseAdapter, cloud: CloudAdapter) {
    this.db = db;
    this.cloud = cloud;
  }

  async runSync(): Promise<SyncResult> {
    const conflicts: SyncConflict[] = [];
    const stats = { pushed: 0, pulled: 0, deletedLocal: 0 };
    
    try {
      const allCloudFiles = await this.cloud.listFiles();
      
      // ===========================
      // PHASE 1: SYNC NOTEBOOKS
      // ===========================
      const localNotebooks = await this.db.getNotebooks(true);
      const cloudNbFiles = allCloudFiles.filter(f => f.startsWith('notebook_') && f.endsWith('.json'));
      
      const cloudNbMap = new Map<string, Notebook>();
      for (const file of cloudNbFiles) {
        const raw = await this.cloud.readFile(file);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            if (data.type === 'notebook') {
              cloudNbMap.set(data.id, data as Notebook);
            }
          } catch(e) {}
        }
      }

      for (const localNb of localNotebooks) {
        const cloudNb = cloudNbMap.get(localNb.id);
        const filePath = `notebook_${localNb.id}.json`;
        const localSyncedAt = localNb.syncedAt || 0;

        if (!cloudNb) {
          if (localSyncedAt === 0) {
            // New local item, push to cloud
            if (!localNb.deleted) {
              const exportNb = { type: 'notebook', ...localNb, syncedAt: undefined };
              await this.cloud.writeFile(filePath, JSON.stringify(exportNb, null, 2));
              localNb.syncedAt = Date.now();
              await this.db.updateNotebook(localNb);
              stats.pushed++;
            }
          } else {
            // Deleted in cloud, delete local
            if (!localNb.deleted) {
              await this.db.deleteNotebook(localNb.id);
              stats.deletedLocal++;
            }
          }
        } else {
          // Exists in both
          const localModified = (localNb.updatedAt || 0) > localSyncedAt;
          const cloudModified = (cloudNb.updatedAt || 0) > localSyncedAt;

          if (localModified && cloudModified) {
            conflicts.push({
              id: localNb.id,
              type: 'notebook',
              name: localNb.name,
              localUpdated: localNb.updatedAt || 0,
              cloudUpdated: cloudNb.updatedAt || 0
            });
          } else if (localModified) {
            // Delete locally -> push deletion?
            if (localNb.deleted) {
              await this.cloud.deleteFile(filePath);
              stats.pushed++;
            } else {
              const exportNb = { type: 'notebook', ...localNb, syncedAt: undefined };
              await this.cloud.writeFile(filePath, JSON.stringify(exportNb, null, 2));
              localNb.syncedAt = Date.now();
              await this.db.updateNotebook(localNb);
              stats.pushed++;
            }
          } else if (cloudModified) {
            if (cloudNb.deleted) {
              if (!localNb.deleted) {
                await this.db.deleteNotebook(localNb.id);
                stats.pulled++;
              }
            } else {
              cloudNb.syncedAt = Date.now();
              await this.db.updateNotebook(cloudNb);
              stats.pulled++;
            }
          }
          cloudNbMap.delete(localNb.id);
        }
      }

      // Remaining cloud notebooks (new from cloud)
      for (const [, cloudNb] of cloudNbMap) {
        if (!cloudNb.deleted) {
          cloudNb.syncedAt = Date.now();
          await this.db.createNotebook(cloudNb);
          stats.pulled++;
        }
      }


      // ===========================
      // PHASE 2: SYNC ENTRIES
      // ===========================
      const localEntries = await this.db.getEntries(true);
      const cloudEntryFiles = allCloudFiles.filter(f => f.startsWith('entry_') && f.endsWith('.json'));

      const cloudEntryMap = new Map<string, Entry>();
      for (const file of cloudEntryFiles) {
        const raw = await this.cloud.readFile(file);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            if (data.type === 'task' || data.type === 'note' || data.type === 'reasoningLine') {
              cloudEntryMap.set(data.id, data as Entry);
            }
          } catch(e) {}
        }
      }

      for (const localEntry of localEntries) {
        const cloudEntry = cloudEntryMap.get(localEntry.id);
        const filePath = `entry_${localEntry.id}.json`;
        const localSyncedAt = localEntry.syncedAt || 0;

        if (!cloudEntry) {
          if (localSyncedAt === 0) {
            if (!localEntry.deleted) {
              const exportEntry = { ...localEntry, syncedAt: undefined };
              await this.cloud.writeFile(filePath, JSON.stringify(exportEntry, null, 2));
              localEntry.syncedAt = Date.now();
              await this.db.updateEntry(localEntry);
              stats.pushed++;
            }
          } else {
            if (!localEntry.deleted) {
              await this.db.deleteEntry(localEntry.id);
              stats.deletedLocal++;
            }
          }
        } else {
          const localModified = (localEntry.updatedAt || 0) > localSyncedAt;
          const cloudModified = (cloudEntry.updatedAt || 0) > localSyncedAt;

          if (localModified && cloudModified) {
            conflicts.push({
              id: localEntry.id,
              type: 'entry',
              name: localEntry.title,
              localUpdated: localEntry.updatedAt || 0,
              cloudUpdated: cloudEntry.updatedAt || 0
            });
          } else if (localModified) {
            if (localEntry.deleted) {
              await this.cloud.deleteFile(filePath);
              stats.pushed++;
            } else {
              const exportEntry = { ...localEntry, syncedAt: undefined };
              await this.cloud.writeFile(filePath, JSON.stringify(exportEntry, null, 2));
              localEntry.syncedAt = Date.now();
              await this.db.updateEntry(localEntry);
              stats.pushed++;
            }
          } else if (cloudModified) {
            if (cloudEntry.deleted) {
              if (!localEntry.deleted) {
                await this.db.deleteEntry(localEntry.id);
                stats.pulled++;
              }
            } else {
              cloudEntry.syncedAt = Date.now();
              await this.db.updateEntry(cloudEntry);
              stats.pulled++;
            }
          }
          cloudEntryMap.delete(localEntry.id);
        }
      }

      for (const [, cloudEntry] of cloudEntryMap) {
        if (!cloudEntry.deleted) {
          cloudEntry.syncedAt = Date.now();
          await this.db.createEntry(cloudEntry);
          stats.pulled++;
        }
      }

      return { success: true, conflicts, ...stats };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro durante a sincronização' };
    }
  }

  async resolveConflict(conflict: SyncConflict, resolution: 'local' | 'cloud'): Promise<void> {
    const filePath = conflict.type === 'notebook' ? `notebook_${conflict.id}.json` : `entry_${conflict.id}.json`;
    
    if (resolution === 'local') {
      if (conflict.type === 'notebook') {
        const notebooks = await this.db.getNotebooks(true);
        const localNb = notebooks.find(n => n.id === conflict.id);
        if (localNb) {
          const exportNb = { type: 'notebook', ...localNb, syncedAt: undefined };
          await this.cloud.writeFile(filePath, JSON.stringify(exportNb, null, 2));
          localNb.syncedAt = Date.now();
          await this.db.updateNotebook(localNb);
        }
      } else {
        const entries = await this.db.getEntries(true);
        const localEntry = entries.find(e => e.id === conflict.id);
        if (localEntry) {
          const exportEntry = { ...localEntry, syncedAt: undefined };
          await this.cloud.writeFile(filePath, JSON.stringify(exportEntry, null, 2));
          localEntry.syncedAt = Date.now();
          await this.db.updateEntry(localEntry);
        }
      }
    } else { // cloud
      const raw = await this.cloud.readFile(filePath);
      if (raw) {
        const data = JSON.parse(raw);
        if (conflict.type === 'notebook') {
          data.syncedAt = Date.now();
          await this.db.updateNotebook(data as Notebook);
        } else {
          data.syncedAt = Date.now();
          await this.db.updateEntry(data as Entry);
        }
      }
    }
  }
}
