import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import SettingsLayout from './layouts/SettingsLayout';
import Login from './pages/Login';
import SkipLink from './components/SkipLink';
import ErrorBoundary from './components/ErrorBoundary';

const Home                    = React.lazy(() => import('./pages/Home'));
const UeberUns                = React.lazy(() => import('./pages/UeberUns'));
const Statuten                = React.lazy(() => import('./pages/Statuten'));
const Beitragsordnung         = React.lazy(() => import('./pages/Beitragsordnung'));
const Veranstaltungen         = React.lazy(() => import('./pages/Veranstaltungen'));
const Bildung                 = React.lazy(() => import('./pages/Bildung'));
const Materialien             = React.lazy(() => import('./pages/Materialien'));
const JoinPage                = React.lazy(() => import('./pages/Join'));
const MembershipSuccessPage   = React.lazy(() => import('./pages/MembershipSuccess'));
const DonatePage              = React.lazy(() => import('./pages/Donate'));
const SuccessPage             = React.lazy(() => import('./pages/Success'));
const KontaktPage             = React.lazy(() => import('./pages/Kontakt'));
const ImpressumPage           = React.lazy(() => import('./pages/Impressum'));
const DatenschutzPage         = React.lazy(() => import('./pages/Datenschutz'));
const SpielPage               = React.lazy(() => import('./pages/Spiel'));
const NotFoundPage            = React.lazy(() => import('./pages/NotFound'));
const Register                = React.lazy(() => import('./pages/Register'));
const PasswordReset           = React.lazy(() => import('./pages/PasswordReset'));
const ForumPage               = React.lazy(() => import('./pages/ForumPage'));
const ForumThread             = React.lazy(() => import('./pages/ForumThread'));
const BlogPage                = React.lazy(() => import('./pages/BlogPage'));
const BlogArticle             = React.lazy(() => import('./pages/BlogArticle'));

const TeamPage                = React.lazy(() => import('./pages/Team'));
const TransparenzPage         = React.lazy(() => import('./pages/Transparenz'));
const PressePage              = React.lazy(() => import('./pages/Presse'));
const ThemenIndex             = React.lazy(() => import('./pages/themen/ThemenIndex'));
const DemokratiePage          = React.lazy(() => import('./pages/themen/Demokratie'));
const MenschenrechtePage      = React.lazy(() => import('./pages/themen/Menschenrechte'));
const SozialeGerechtigkeitPage = React.lazy(() => import('./pages/themen/SozialeGerechtigkeit'));

const MemberArea              = React.lazy(() => import('./pages/MemberArea'));
const MemberDashboard         = React.lazy(() => import('./pages/MemberDashboard'));
const MemberOnboarding        = React.lazy(() => import('./pages/MemberOnboarding'));
const PrivacySettings         = React.lazy(() => import('./pages/PrivacySettings'));

const AdminDashboard          = React.lazy(() => import('./pages/admin/AdminDashboard'));
const MemberManagement        = React.lazy(() => import('./pages/MemberManagement'));
const BoardTreasurerDashboard = React.lazy(() => import('./pages/BoardTreasurerDashboard'));
const AdminQueuePage          = React.lazy(() => import('./pages/AdminQueue'));
const FinanceDashboard        = React.lazy(() => import('./pages/admin/FinanceDashboard'));
const AdminEvents             = React.lazy(() => import('./pages/admin/AdminEvents'));
const AdminNewsletter         = React.lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminDSGVO              = React.lazy(() => import('./pages/admin/AdminDSGVO'));
const AdminReports            = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings           = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminOpenClaw           = React.lazy(() => import('./pages/admin/AdminOpenClaw'));

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/ueber-uns" element={<UeberUns />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/transparenz" element={<TransparenzPage />} />
            <Route path="/presse" element={<PressePage />} />
            <Route path="/themen" element={<ThemenIndex />} />
            <Route path="/themen/demokratie" element={<DemokratiePage />} />
            <Route path="/themen/menschenrechte" element={<MenschenrechtePage />} />
            <Route path="/themen/soziale-gerechtigkeit" element={<SozialeGerechtigkeitPage />} />
            <Route path="/statuten" element={<Statuten />} />
            <Route path="/beitragsordnung" element={<Beitragsordnung />} />
            <Route path="/veranstaltungen" element={<Veranstaltungen />} />
            <Route path="/bildung" element={<Bildung />} />
            <Route path="/materialien" element={<Materialien />} />
            <Route path="/mitglied-werden" element={<ErrorBoundary section="Mitgliedschaft"><JoinPage /></ErrorBoundary>} />
            <Route path="/mitglied-werden/danke" element={<ErrorBoundary section="Mitgliedschaft"><MembershipSuccessPage /></ErrorBoundary>} />
            <Route path="/spenden" element={<ErrorBoundary section="Spenden"><DonatePage /></ErrorBoundary>} />
            <Route path="/erfolg" element={<ErrorBoundary section="Spenden"><SuccessPage /></ErrorBoundary>} />
            <Route path="/spiel" element={<SpielPage />} />
            <Route path="/kontakt" element={<KontaktPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:threadId" element={<ForumThread />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:articleId" element={<BlogArticle />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/passwort-vergessen" element={<PasswordReset />} />
            <Route path="/passwort-reset" element={<PasswordReset />} />
          </Route>

          <Route path="/registrieren" element={<Register />} />

          <Route element={<ErrorBoundary section="Mitgliederbereich"><ProtectedRoute><DashboardLayout /></ProtectedRoute></ErrorBoundary>}>
            <Route path="/member" element={<MemberArea />} />
            <Route path="/member/profil" element={<MemberArea />} />
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/onboarding" element={<MemberOnboarding />} />
          </Route>

          <Route element={<ErrorBoundary section="Administration"><AdminRoute><DashboardLayout /></AdminRoute></ErrorBoundary>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vorstand" element={<BoardTreasurerDashboard />} />
            <Route path="/admin/members" element={<MemberManagement />} />
            <Route path="/admin/queue" element={<AdminQueuePage />} />
            <Route path="/admin/finanzen" element={<FinanceDashboard />} />
            <Route path="/admin/rechnungen" element={<FinanceDashboard />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            <Route path="/admin/dsgvo" element={<AdminDSGVO />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/openclaw" element={<AdminOpenClaw />} />
          </Route>

          <Route element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
            <Route path="/account/privacy" element={<PrivacySettings />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
