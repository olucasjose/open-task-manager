import { useEffect, useState } from 'react';
import { useServices } from '../hooks/useServices';
import { useStore } from '../store/useStore';
import { useSyncController } from '../controllers/useSyncController';
import type { SyncState } from '../types';

export function SyncScreen() {
  const { syncStateService, db } = useServices();
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  
  const isSyncing = useStore((state) => state.isSyncing);
  const setSyncing = useStore((state) => state.setSyncing);
  const setStoreData = useStore((state) => state.setStoreData);

  useEffect(() => {
    syncStateService.getSyncState().then(setSyncState);
  }, [syncStateService]);

  const handleDataRefreshNeeded = async () => {
    const [entries, notebooks] = await Promise.all([db.getEntries(), db.getNotebooks()]);
    setStoreData(entries, notebooks);
  };

  const {
    conflicts,
    lastResult,
    handleConnectDropbox,
    handleDisconnect,
    handleSync,
    handleResolveConflict
  } = useSyncController({
    syncStateService,
    db,
    syncState,
    onSyncStateUpdate: setSyncState,
    onSyncStart: () => setSyncing(true),
    onSyncEnd: () => setSyncing(false),
    onDataRefreshNeeded: handleDataRefreshNeeded
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Nuvem e Sincronização</h1>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Provedor de Nuvem</h2>
          
          {syncState?.provider === 'dropbox' ? (
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Conectado ao Dropbox
              </p>
              {syncState.lastSync && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Última sincronização: {new Date(syncState.lastSync).toLocaleString()}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => handleSync(syncState)}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Conecte-se a um provedor de nuvem para sincronizar seus cadernos e entradas.
              </p>
              <button
                onClick={handleConnectDropbox}
                className="px-4 py-2 bg-[#0061FE] text-white rounded-lg hover:bg-[#0051D6] transition-colors font-medium flex items-center gap-2"
              >
                Conectar com Dropbox
              </button>
            </div>
          )}
        </div>

        {lastResult && (
          <div className={`p-4 rounded-xl mb-6 ${lastResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
            <p className="font-medium">{lastResult.success ? 'Sincronização concluída!' : 'Erro na sincronização'}</p>
            {lastResult.success && (
              <ul className="text-sm mt-2 space-y-1">
                <li>Enviados: {lastResult.pushed || 0}</li>
                <li>Baixados: {lastResult.pulled || 0}</li>
                <li>Deletados localmente: {lastResult.deletedLocal || 0}</li>
              </ul>
            )}
            {lastResult.error && <p className="text-sm mt-1">{lastResult.error}</p>}
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4">Conflitos Detectados ({conflicts.length})</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Alguns itens foram alterados localmente e na nuvem ao mesmo tempo. Escolha qual versão manter.
            </p>
            
            <div className="space-y-4">
              {conflicts.map(conflict => (
                <div key={conflict.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{conflict.name} <span className="text-xs text-gray-500 uppercase">({conflict.type})</span></p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button
                      onClick={() => handleResolveConflict(conflict, 'local')}
                      className="flex-1 p-3 text-left border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <span className="block font-medium text-blue-800 dark:text-blue-300">Manter Local</span>
                      <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">Alterado: {new Date(conflict.localUpdated).toLocaleString()}</span>
                    </button>
                    <button
                      onClick={() => handleResolveConflict(conflict, 'cloud')}
                      className="flex-1 p-3 text-left border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      <span className="block font-medium text-purple-800 dark:text-purple-300">Manter da Nuvem</span>
                      <span className="block text-xs text-purple-600 dark:text-purple-400 mt-1">Alterado: {new Date(conflict.cloudUpdated).toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
