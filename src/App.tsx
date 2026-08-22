import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeScreen } from './pages/HomeScreen';
import { EntryDetailScreen } from './pages/EntryDetailScreen';
import { TrashScreen } from './pages/TrashScreen';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
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
