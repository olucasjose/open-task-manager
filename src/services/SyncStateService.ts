import type { SyncState } from '../types';

export const DEFAULT_SYNC_STATE: SyncState = {
  provider: null,
};

export class SyncStateService {
  private readonly storageKey = 'app_sync_state';

  async getSyncState(): Promise<SyncState> {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return { ...DEFAULT_SYNC_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse sync state from localStorage', e);
    }
    return DEFAULT_SYNC_STATE;
  }

  async saveSyncState(state: SyncState): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save sync state to localStorage', e);
    }
  }

  async saveCodeVerifier(verifier: string): Promise<void> {
    localStorage.setItem('dropbox_code_verifier', verifier);
  }

  async getCodeVerifier(): Promise<string | null> {
    return localStorage.getItem('dropbox_code_verifier');
  }

  async clearCodeVerifier(): Promise<void> {
    localStorage.removeItem('dropbox_code_verifier');
  }
}
