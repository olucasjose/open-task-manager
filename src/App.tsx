import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

import { HomeScreen } from './pages/HomeScreen';
import { EntryDetailScreen } from './pages/EntryDetailScreen';
import { TrashScreen } from './pages/TrashScreen';
import { MainLayout } from './layouts/MainLayout';

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
  return (
    <BrowserRouter>
      <BackButtonHandler />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/notebook/all" replace />} />
          <Route path="/notebook/:id" element={<HomeScreen />} />
          <Route path="/trash" element={<TrashScreen />} />
          <Route path="/entry/:id" element={<EntryDetailScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
