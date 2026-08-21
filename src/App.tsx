import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomeScreen } from './pages/HomeScreen';
import { EntryDetailScreen } from './pages/EntryDetailScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/entry/:id" element={<EntryDetailScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
