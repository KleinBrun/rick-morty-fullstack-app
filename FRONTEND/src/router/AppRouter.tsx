import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CharactersPage } from '../pages/CharactersPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CharactersPage />} />
        <Route path="/character/:characterId" element={<CharactersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
