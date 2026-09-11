import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { useStore } from '../store/useStore';
import { useSyncController } from '../controllers/useSyncController';


export function SyncCallbackScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { syncStateService, db } = useServices();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  
  const setStoreData = useStore((state) => state.setStoreData);
  const setSyncing = useStore((state) => state.setSyncing);

  const [status, setStatus] = useState<string>('Processando autorização...');
  const initialized = useRef(false);

  const handleDataRefreshNeeded = async () => {
    const [entries, notebooks] = await Promise.all([db.getEntries(), db.getNotebooks()]);
    setStoreData(entries, notebooks);
  };

  const { handleDropboxCallback } = useSyncController({
    syncStateService,
    db,
    syncState: null,
    onSyncStateUpdate: () => {},
    onSyncStart: () => setSyncing(true),
    onSyncEnd: () => setSyncing(false),
    onDataRefreshNeeded: handleDataRefreshNeeded
  });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (error) {
      setStatus(`Erro: ${error_description || error}`);
      return;
    }

    if (!code) {
      setStatus('Nenhum código de autorização fornecido.');
      return;
    }

    const process = async () => {
      try {
        await handleDropboxCallback(code);
        setStatus('Sucesso! Redirecionando...');
        setTimeout(() => {
          navigate('/sync', { replace: true });
        }, 1500);
      } catch (e: any) {
        setStatus(`Falha: ${e.message}`);
      }
    };

    process();
  }, [code, error, error_description, handleDropboxCallback, navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 text-center max-w-md w-full">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Autenticação Dropbox</h1>
        <p className="text-gray-600 dark:text-gray-400">{status}</p>
        
        <button
          onClick={() => navigate('/sync')}
          className="mt-6 text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          Voltar para Configurações
        </button>
      </div>
    </div>
  );
}
