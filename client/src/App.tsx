import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import MatchesPage from './pages/MatchesPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaceholderPage from './pages/PlaceholderPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route path="matches" element={<MatchesPage filter="ALL" />} />
        <Route path="matches/live" element={<MatchesPage filter="LIVE" />} />
        <Route path="matches/upcoming" element={<MatchesPage filter="UPCOMING" />} />
        <Route path="matches/completed" element={<MatchesPage filter="COMPLETED" />} />
        <Route path="matches/:id" element={<MatchDetailsPage />} />

        <Route path="tournaments" element={<PlaceholderPage title="Tournaments" />} />
        <Route path="teams" element={<PlaceholderPage title="Teams" />} />
        <Route path="players" element={<PlaceholderPage title="Players" />} />
        <Route path="rankings" element={<PlaceholderPage title="Rankings" />} />
        <Route path="news" element={<PlaceholderPage title="News" />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
