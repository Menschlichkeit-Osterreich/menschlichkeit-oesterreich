import { lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import CrossHostRedirect from './components/CrossHostRedirect';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import {
  buildPortalProbeUrl,
  buildPortalUrl,
  buildPublicUrl,
  getRuntimeHostVariant,
  mapLegacyPortalPath,
  PUBLIC_PORTAL_ENTRY_PATH,
} from './utils/runtimeHost';

const Home = lazy(() => import('./pages/Home'));
const UeberUns = lazy(() => import('./pages/UeberUns'));
const Statuten = lazy(() => import('./pages/Statuten'));
const Beitragsordnung = lazy(() => import('./pages/Beitragsordnung'));
const Veranstaltungen = lazy(() => import('./pages/Veranstaltungen'));
const Bildung = lazy(() => import('./pages/Bildung'));
const Materialien = lazy(() => import('./pages/Materialien'));
const JoinPage = lazy(() => import('./pages/Join'));
const MembershipSuccessPage = lazy(() => import('./pages/MembershipSuccess'));
const DonatePage = lazy(() => import('./pages/Donate'));
const SuccessPage = lazy(() => import('./pages/Success'));
const KontaktPage = lazy(() => import('./pages/Kontakt'));
const ImpressumPage = lazy(() => import('./pages/Impressum'));
const DatenschutzPage = lazy(() => import('./pages/Datenschutz'));
const BarrierefreiheitPage = lazy(() => import('./pages/Barrierefreiheit'));
const SpielPage = lazy(() => import('./pages/Spiel'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const ForumThread = lazy(() => import('./pages/ForumThread'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogArticle = lazy(() => import('./pages/BlogArticle'));
const MitmachenPage = lazy(() => import('./pages/Mitmachen'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const PasswordReset = lazy(() => import('./pages/PasswordReset'));
const TeamPage = lazy(() => import('./pages/Team'));
const TransparenzPage = lazy(() => import('./pages/Transparenz'));
const PressePage = lazy(() => import('./pages/Presse'));
const ThemenIndex = lazy(() => import('./pages/themen/ThemenIndex'));
const DemokratiePage = lazy(() => import('./pages/themen/Demokratie'));
const MenschenrechtePage = lazy(() => import('./pages/themen/Menschenrechte'));
const SozialeGerechtigkeitPage = lazy(() => import('./pages/themen/SozialeGerechtigkeit'));
const MemberArea = lazy(() => import('./pages/MemberArea'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const MemberOnboarding = lazy(() => import('./pages/MemberOnboarding'));
const MemberSepa = lazy(() => import('./pages/MemberSepa'));
const MemberBilling = lazy(() => import('./pages/MemberBilling'));
const MemberNewsletter = lazy(() => import('./pages/MemberNewsletter'));
const PrivacySettings = lazy(() => import('./pages/PrivacySettings'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const MemberManagement = lazy(() => import('./pages/MemberManagement'));
const BoardTreasurerDashboard = lazy(() => import('./pages/BoardTreasurerDashboard'));
const AdminQueuePage = lazy(() => import('./pages/AdminQueue'));
const FinanceDashboard = lazy(() => import('./pages/admin/FinanceDashboard'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminDSGVO = lazy(() => import('./pages/admin/AdminDSGVO'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminCommunity = lazy(() => import('./pages/admin/AdminCommunity'));

function PortalEntryRoute() {
  const { token, hasBackofficeAccess } = useAuth();
  return <Navigate replace to={token ? (hasBackofficeAccess ? '/admin' : '/member') : '/login'} />;
}

function RedirectCurrentPathToPortal() {
  const location = useLocation();
  const target = `${mapLegacyPortalPath(location.pathname)}${location.search || ''}${location.hash || ''}`;
  const isLoginEntry =
    target === PUBLIC_PORTAL_ENTRY_PATH ||
    target.startsWith('/passwort-vergessen') ||
    target.startsWith('/passwort-reset');
  return (
    <CrossHostRedirect
      to={buildPortalUrl(target)}
      title={isLoginEntry ? 'Weiter zum CRM-Portal' : 'Weiter zum geschützten Bereich'}
      description={
        isLoginEntry
          ? 'Das Mitgliederportal wird zentral auf crm.menschlichkeit-oesterreich.at bereitgestellt.'
          : 'Geschützte Bereiche werden zentral auf crm.menschlichkeit-oesterreich.at bereitgestellt.'
      }
      probeUrl={buildPortalProbeUrl()}
      failureTitle="CRM-Portal derzeit nicht erreichbar"
      failureDescription="Das CRM-Portal hat gerade nicht geantwortet. Sie bleiben auf der öffentlichen Website und können es später erneut versuchen oder uns direkt kontaktieren."
      fallbackActions={[
        { href: buildPublicUrl('/kontakt'), label: 'Kontakt aufnehmen' },
        { href: buildPublicUrl('/mitglied-werden'), label: 'Mitglied werden' },
      ]}
    />
  );
}

function RedirectCurrentPathToPublic() {
  const location = useLocation();
  const target = `${location.pathname}${location.search || ''}${location.hash || ''}`;
  return (
    <CrossHostRedirect
      to={buildPublicUrl(target)}
      title="Weiterleitung zur Website"
      description="Öffentliche Inhalte werden auf www.menschlichkeit-oesterreich.at bereitgestellt."
    />
  );
}

function buildPublicRoutes() {
  return (
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
        <Route path="/mitmachen" element={<MitmachenPage />} />
        <Route path="/mitglied-werden" element={<JoinPage />} />
        <Route path="/mitglied-werden/danke" element={<MembershipSuccessPage />} />
        <Route path="/spenden" element={<DonatePage />} />
        <Route path="/erfolg" element={<SuccessPage />} />
        <Route path="/spiel" element={<SpielPage />} />
        <Route path="/kontakt" element={<KontaktPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/barrierefreiheit" element={<BarrierefreiheitPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:threadId" element={<ForumThread />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:articleId" element={<BlogArticle />} />
      </Route>

      <Route path="/registrieren" element={<Navigate replace to="/mitglied-werden" />} />
      <Route path="/agb" element={<Navigate replace to="/statuten" />} />
      <Route path="/login" element={<RedirectCurrentPathToPortal />} />
      <Route path="/passwort-vergessen" element={<RedirectCurrentPathToPortal />} />
      <Route path="/passwort-reset" element={<RedirectCurrentPathToPortal />} />
      <Route path="/member/*" element={<RedirectCurrentPathToPortal />} />
      <Route path="/admin/*" element={<RedirectCurrentPathToPortal />} />
      <Route path="/account/*" element={<RedirectCurrentPathToPortal />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function buildPortalRoutes() {
  return (
    <Routes>
      <Route index element={<PortalEntryRoute />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/passwort-vergessen" element={<PasswordReset />} />
        <Route path="/passwort-reset" element={<PasswordReset />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/member" element={<MemberArea />} />
        <Route path="/member/profil" element={<MemberArea />} />
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/onboarding" element={<MemberOnboarding />} />
        <Route path="/member/sepa" element={<MemberSepa />} />
        <Route path="/member/rechnungen" element={<MemberBilling />} />
        <Route path="/member/newsletter" element={<MemberNewsletter />} />
        <Route path="/member/datenschutz" element={<PrivacySettings />} />
      </Route>

      <Route
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/vorstand" element={<BoardTreasurerDashboard />} />
        <Route path="/admin/members" element={<MemberManagement />} />
        <Route path="/admin/queue" element={<AdminQueuePage />} />
        <Route path="/admin/finanzen" element={<FinanceDashboard />} />
        <Route path="/admin/rechnungen" element={<FinanceDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        <Route path="/admin/community" element={<AdminCommunity />} />
        <Route path="/admin/dsgvo" element={<AdminDSGVO />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="/account/privacy" element={<Navigate replace to="/member/datenschutz" />} />
      <Route path="/account/profile" element={<Navigate replace to="/member/profil" />} />
      <Route path="/account/sepa" element={<Navigate replace to="/member/sepa" />} />
      <Route path="/account/receipts" element={<Navigate replace to="/member/rechnungen" />} />
      <Route path="/account/newsletter" element={<Navigate replace to="/member/newsletter" />} />
      <Route
        path="/registrieren"
        element={<CrossHostRedirect to={buildPublicUrl('/mitglied-werden')} />}
      />
      <Route path="/native/*" element={<RedirectCurrentPathToPortal />} />
      <Route path="*" element={<RedirectCurrentPathToPublic />} />
    </Routes>
  );
}

export default function AppRoutes() {
  return getRuntimeHostVariant() === 'crm' ? buildPortalRoutes() : buildPublicRoutes();
}
