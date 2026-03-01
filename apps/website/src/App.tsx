import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import SettingsLayout from './layouts/SettingsLayout';
import Login from './pages/Login';
import SkipLink from './components/SkipLink';

// ── Lazy Imports (alle öffentlichen Seiten) ───────────────────────────────────
const Home                    = React.lazy(() => import('./pages/Home'));
const UeberUns                = React.lazy(() => import('./pages/UeberUns'));
const Statuten                = React.lazy(() => import('./pages/Statuten'));
const Beitragsordnung         = React.lazy(() => import('./pages/Beitragsordnung'));
const Veranstaltungen         = React.lazy(() => import('./pages/Veranstaltungen'));
const Bildung                 = React.lazy(() => import('./pages/Bildung'));
const Materialien             = React.lazy(() => import('./pages/Materialien'));
const JoinPage                = React.lazy(() => import('./pages/Join'));
const DonatePage              = React.lazy(() => import('./pages/Donate'));
const SuccessPage             = React.lazy(() => import('./pages/Success'));
const KontaktPage             = React.lazy(() => import('./pages/Kontakt'));
const ImpressumPage           = React.lazy(() => import('./pages/Impressum'));
const DatenschutzPage         = React.lazy(() => import('./pages/Datenschutz'));
const NotFoundPage            = React.lazy(() => import('./pages/NotFound'));

// ── Lazy Imports (Auth & Dashboard) ──────────────────────────────────────────
const MemberArea              = React.lazy(() => import('./pages/MemberArea'));
const MemberManagement        = React.lazy(() => import('./pages/MemberManagement'));
const BoardTreasurerDashboard = React.lazy(() => import('./pages/BoardTreasurerDashboard'));
const AdminQueuePage          = React.lazy(() => import('./pages/AdminQueue'));
const FinanceDashboard        = React.lazy(() => import('./pages/admin/FinanceDashboard'));
const PrivacySettings         = React.lazy(() => import('./pages/PrivacySettings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-semantic-background">
      <div className="text-center">
        <div
          className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full motion-safe:animate-spin mx-auto mb-4"
          role="status"
          aria-live="polite"
          aria-label="Seite wird geladen"
        />
        <p className="text-sm text-semantic-text-secondary">Wird geladen…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <main id="main">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Öffentliche Seiten ── */}
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/ueber-uns" element={<UeberUns />} />
              <Route path="/statuten" element={<Statuten />} />
              <Route path="/beitragsordnung" element={<Beitragsordnung />} />
              <Route path="/veranstaltungen" element={<Veranstaltungen />} />
              <Route path="/bildung" element={<Bildung />} />
              <Route path="/materialien" element={<Materialien />} />
              <Route path="/mitglied-werden" element={<JoinPage />} />
              <Route path="/spenden" element={<DonatePage />} />
              <Route path="/erfolg" element={<SuccessPage />} />
              <Route path="/kontakt" element={<KontaktPage />} />
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/datenschutz" element={<DatenschutzPage />} />
            </Route>

            {/* ── Auth ── */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/Login" element={<Login />} />
            </Route>

            {/* ── Mitgliederbereich ── */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/member" element={<MemberArea />} />
              <Route path="/member/profil" element={<MemberArea />} />
            </Route>

            {/* ── Admin-Bereich ── */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<BoardTreasurerDashboard />} />
              <Route path="/admin/members" element={<MemberManagement />} />
              <Route path="/admin/queue" element={<AdminQueuePage />} />
              <Route path="/admin/finanzen" element={<FinanceDashboard />} />
            </Route>

            {/* ── Einstellungen ── */}
            <Route element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
              <Route path="/account/privacy" element={<PrivacySettings />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}
