import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

import { HomeScreen } from './pages/HomeScreen';
import { EntryDetailScreen } from './pages/EntryDetailScreen';
import { TrashScreen } from './pages/TrashScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { MainLayout } from './layouts/MainLayout';
import { DatabaseFacade } from './lib/db';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { useStore } from './store/useStore';

function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener('backButton', () => {
      // Rotas raiz que fecham o app
      const isRoot = 
        location.pathname === '/' || 
        location.pathname.startsWith('/notebook/') || 
        location.pathname === '/trash';
      
      if (isRoot) {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [location, navigate]);

  return null;
}

function App() {
  const [database] = useState(() => new DatabaseFacade());
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    database.init()
      .then(() => {
        setIsDbReady(true);
        Promise.all([database.getEntries(), database.getNotebooks()]).then(([entries, notebooks]) => {
          useStore.getState().setStoreData(entries, notebooks);
        });
      })
      .catch((e) => {
        console.error('Failed to initialize database', e);
        setDbError(e.message || String(e));
      });
  }, []);

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Erro Crítico</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">{dbError}</p>
        </div>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <p className="text-gray-500 dark:text-gray-400 font-medium">Iniciando sistema...</p>
      </div>
    );
  }

  return (
    <DatabaseProvider db={database}>
      <BrowserRouter>
        <BackButtonHandler />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/notebook/all" replace />} />
            <Route path="/notebook/:id" element={<HomeScreen />} />
            <Route path="/trash" element={<TrashScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/entry/:id" element={<EntryDetailScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DatabaseProvider>
  );
}

export default App;
