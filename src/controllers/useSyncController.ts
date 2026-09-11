import { useState, useCallback } from 'react';
import type { SyncStateService } from '../services/SyncStateService';
import { SyncService } from '../services/SyncService';
import { DropboxAdapter, getDropboxAuthUrl, exchangeCodeForTokens, refreshAccessToken } from '../lib/cloud/DropboxAdapter';
import { generateCodeVerifier, generateCodeChallenge } from '../lib/cloud/PKCEUtil';
import type { DatabaseAdapter } from '../lib/db/DatabaseAdapter';
import type { SyncState, SyncConflict, SyncResult } from '../types';

interface UseSyncControllerProps {
  syncStateService: SyncStateService;
  db: DatabaseAdapter;
  syncState: SyncState | null;
  onSyncStateUpdate: (state: SyncState) => void;
  onSyncStart: () => void;
  onSyncEnd: () => void;
  onDataRefreshNeeded: () => void;
}

export function useSyncController({
  syncStateService,
  db,
  syncState,
  onSyncStateUpdate,
  onSyncStart,
  onSyncEnd,
  onDataRefreshNeeded
}: UseSyncControllerProps) {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const getRedirectUri = () => {
    return window.location.origin + '/sync/callback';
  };

  const handleConnectDropbox = useCallback(async () => {
    try {
      const verifier = await generateCodeVerifier();
      await syncStateService.saveCodeVerifier(verifier);
      const challenge = await generateCodeChallenge(verifier);
      const authUrl = getDropboxAuthUrl(challenge, getRedirectUri());
      window.location.href = authUrl;
    } catch (e: any) {
      alert(`Erro ao conectar: ${e.message}`);
    }
  }, [syncStateService]);

  const handleDropboxCallback = useCallback(async (code: string) => {
    try {
      const verifier = await syncStateService.getCodeVerifier();
      if (!verifier) throw new Error('Code verifier não encontrado.');
      
      const tokens = await exchangeCodeForTokens(code, verifier, getRedirectUri());
      await syncStateService.clearCodeVerifier();
      
      const newState: SyncState = {
        provider: 'dropbox',
        dropboxRefreshToken: tokens.refreshToken,
      };
      
      await syncStateService.saveSyncState(newState);
      onSyncStateUpdate(newState);
      
      // Attempt first sync
      await handleSync(newState);
    } catch (e: any) {
      alert(`Erro na autorização: ${e.message}`);
    }
  }, [syncStateService, onSyncStateUpdate]);

  const handleDisconnect = useCallback(async () => {
    const newState: SyncState = { provider: null };
    await syncStateService.saveSyncState(newState);
    onSyncStateUpdate(newState);
    setConflicts([]);
    setLastResult(null);
  }, [syncStateService, onSyncStateUpdate]);

  const handleSync = async (stateToUse: SyncState | null = syncState) => {
    if (!stateToUse || stateToUse.provider !== 'dropbox' || !stateToUse.dropboxRefreshToken) {
      return;
    }

    onSyncStart();
    setConflicts([]);
    setLastResult(null);

    try {
      const accessToken = await refreshAccessToken(stateToUse.dropboxRefreshToken);
      const cloudAdapter = new DropboxAdapter(accessToken);
      const syncService = new SyncService(db, cloudAdapter);
      
      const result = await syncService.runSync();
      setLastResult(result);
      
      if (result.success) {
        if (result.conflicts && result.conflicts.length > 0) {
          setConflicts(result.conflicts);
        } else {
          const newState = { ...stateToUse, lastSync: Date.now() };
          await syncStateService.saveSyncState(newState);
          onSyncStateUpdate(newState);
        }
        
        if ((result.pushed && result.pushed > 0) || (result.pulled && result.pulled > 0) || (result.deletedLocal && result.deletedLocal > 0)) {
          onDataRefreshNeeded();
        }
      } else {
        alert(`Erro na sincronização: ${result.error}`);
      }
    } catch (e: any) {
      alert(`Falha na sincronização: ${e.message}`);
    } finally {
      onSyncEnd();
    }
  };

  const handleResolveConflict = async (conflict: SyncConflict, resolution: 'local' | 'cloud') => {
    if (!syncState || syncState.provider !== 'dropbox' || !syncState.dropboxRefreshToken) return;
    
    onSyncStart();
    try {
      const accessToken = await refreshAccessToken(syncState.dropboxRefreshToken);
      const cloudAdapter = new DropboxAdapter(accessToken);
      const syncService = new SyncService(db, cloudAdapter);
      
      await syncService.resolveConflict(conflict, resolution);
      
      const remaining = conflicts.filter(c => c.id !== conflict.id);
      setConflicts(remaining);
      
      if (remaining.length === 0) {
        const newState = { ...syncState, lastSync: Date.now() };
        await syncStateService.saveSyncState(newState);
        onSyncStateUpdate(newState);
      }
      
      onDataRefreshNeeded();
    } catch (e: any) {
      alert(`Erro ao resolver conflito: ${e.message}`);
    } finally {
      onSyncEnd();
    }
  };

  return {
    conflicts,
    lastResult,
    handleConnectDropbox,
    handleDropboxCallback,
    handleDisconnect,
    handleSync,
    handleResolveConflict
  };
}
