import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AITestPage from './pages/AITestPage';
import PrivacySettings from './pages/PrivacySettings';
import ProtectedRoute from './components/ProtectedRoute';
import MemberArea from './pages/MemberArea';
import Login from './pages/Login';
import SkipLink from './components/SkipLink';
import FigmaDemo from './pages/FigmaDemo';
import JoinPage from './pages/Join';
const DonatePage = React.lazy(() => import('./pages/Donate'));
import SuccessPage from './pages/Success';
import StatutenPage from './pages/Statuten';
import BeitragsordnungPage from './pages/Beitragsordnung';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import SettingsLayout from './layouts/SettingsLayout';
import AdminQueuePage from './pages/AdminQueue';

// Fallback für fehlende Components
const Home = React.lazy(() =>
  import('./pages/Home').catch(() => ({ default: () => <AITestPage /> }))
);

export default function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <main id="main">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                {/* Reduce motion for users who prefer it */}
                <div
                  className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full motion-safe:animate-spin mx-auto mb-4"
                  role="status"
                  aria-live="polite"
                  aria-label="Ladevorgang"
                />
                <p className="text-muted">🤖 KI-System wird geladen...</p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<AITestPage />} />
              <Route path="/ai-demo" element={<AITestPage />} />
              <Route path="/figma-demo" element={<FigmaDemo />} />
              <Route path="/home" element={<Home />} />
              <Route path="/mitglied-werden" element={<JoinPage />} />
              <Route path="/spenden" element={<DonatePage />} />
              <Route path="/erfolg" element={<SuccessPage />} />
              <Route path="/statuten" element={<StatutenPage />} />
              <Route path="/beitragsordnung" element={<BeitragsordnungPage />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/Login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/member" element={<MemberArea />} />
              <Route path="/admin/queue" element={<AdminQueuePage />} />
            </Route>

            <Route element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
              <Route path="/account/privacy" element={<PrivacySettings />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}
