import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import CrossHostRedirect from './components/CrossHostRedirect';
import { buildPortalUrl, buildPublicUrl, getRuntimeHostVariant, mapLegacyPortalPath } from './utils/runtimeHost';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import UeberUns from './pages/UeberUns';
import Statuten from './pages/Statuten';
import Beitragsordnung from './pages/Beitragsordnung';
import Veranstaltungen from './pages/Veranstaltungen';
import Bildung from './pages/Bildung';
import Materialien from './pages/Materialien';
import JoinPage from './pages/Join';
import MembershipSuccessPage from './pages/MembershipSuccess';
import DonatePage from './pages/Donate';
import SuccessPage from './pages/Success';
import KontaktPage from './pages/Kontakt';
import ImpressumPage from './pages/Impressum';
import DatenschutzPage from './pages/Datenschutz';
import SpielPage from './pages/Spiel';
import ForumPage from './pages/ForumPage';
import ForumThread from './pages/ForumThread';
import BlogPage from './pages/BlogPage';
import BlogArticle from './pages/BlogArticle';
import MitmachenPage from './pages/Mitmachen';
import NotFoundPage from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import TeamPage from './pages/Team';
import TransparenzPage from './pages/Transparenz';
import PressePage from './pages/Presse';
import ThemenIndex from './pages/themen/ThemenIndex';
import DemokratiePage from './pages/themen/Demokratie';
import MenschenrechtePage from './pages/themen/Menschenrechte';
import SozialeGerechtigkeitPage from './pages/themen/SozialeGerechtigkeit';
import MemberArea from './pages/MemberArea';
import MemberDashboard from './pages/MemberDashboard';
import MemberOnboarding from './pages/MemberOnboarding';
import MemberSepa from './pages/MemberSepa';
import MemberBilling from './pages/MemberBilling';
import MemberNewsletter from './pages/MemberNewsletter';
import PrivacySettings from './pages/PrivacySettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberManagement from './pages/MemberManagement';
import BoardTreasurerDashboard from './pages/BoardTreasurerDashboard';
import AdminQueuePage from './pages/AdminQueue';
import FinanceDashboard from './pages/admin/FinanceDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminDSGVO from './pages/admin/AdminDSGVO';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminOpenClaw from './pages/admin/AdminOpenClaw';
import AdminCommunity from './pages/admin/AdminCommunity';

function PortalEntryRoute() {
  const { token, hasBackofficeAccess } = useAuth();
  return <Navigate replace to={token ? (hasBackofficeAccess ? '/admin' : '/member') : '/login'} />;
}

function RedirectCurrentPathToPortal() {
  const location = useLocation();
  const target = `${mapLegacyPortalPath(location.pathname)}${location.search || ''}${location.hash || ''}`;
  return (
    <CrossHostRedirect
      to={buildPortalUrl(target)}
      title="Weiterleitung zum CRM-Portal"
      description="Geschützte Bereiche werden zentral auf crm.menschlichkeit-oesterreich.at bereitgestellt."
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
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:threadId" element={<ForumThread />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:articleId" element={<BlogArticle />} />
      </Route>

      <Route path="/registrieren" element={<Register />} />
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
        element={(
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        )}
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
        element={(
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        )}
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
        <Route path="/admin/openclaw" element={<AdminOpenClaw />} />
      </Route>

      <Route path="/account/privacy" element={<Navigate replace to="/member/datenschutz" />} />
      <Route path="/account/profile" element={<Navigate replace to="/member/profil" />} />
      <Route path="/account/sepa" element={<Navigate replace to="/member/sepa" />} />
      <Route path="/account/receipts" element={<Navigate replace to="/member/rechnungen" />} />
      <Route path="/account/newsletter" element={<Navigate replace to="/member/newsletter" />} />
      <Route path="/registrieren" element={<CrossHostRedirect to={buildPublicUrl('/mitglied-werden')} />} />
      <Route path="/native/*" element={<RedirectCurrentPathToPortal />} />
      <Route path="*" element={<RedirectCurrentPathToPublic />} />
    </Routes>
  );
}

export default function AppRoutes() {
  return getRuntimeHostVariant() === 'crm' ? buildPortalRoutes() : buildPublicRoutes();
}
