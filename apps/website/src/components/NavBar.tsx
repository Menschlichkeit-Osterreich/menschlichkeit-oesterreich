import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { buildPortalUrl, buildPublicUrl, isPortalHost } from '../utils/runtimeHost';

type LocalNavLinkProps = {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
};

function LocalNavLink({ to, children, onClick }: LocalNavLinkProps) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        'rounded-full px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

type ExternalNavLinkProps = {
  href: string;
  children: React.ReactNode;
  subtle?: boolean;
};

function ExternalNavLink({ href, children, subtle = false }: ExternalNavLinkProps) {
  return (
    <a
      className={[
        'rounded-full px-3 py-2 text-sm font-medium transition-colors',
        subtle
          ? 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
          : 'bg-primary-600 text-white hover:bg-primary-700',
      ].join(' ')}
      href={href}
    >
      {children}
    </a>
  );
}

function BrandLink({ href, label }: { href: string; label: string }) {
  const content = (
    <>
      <img
        src="/logo.jpg"
        alt="Verein Menschlichkeit Österreich"
        width={960}
        height={960}
        decoding="async"
        className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-100 transition-all"
      />
      <div className="hidden sm:block">
        <span className="block text-xs font-medium uppercase tracking-wider text-secondary-400">
          Verein
        </span>
        <span className="block text-base font-bold leading-tight text-secondary-900">{label}</span>
      </div>
    </>
  );

  return href.startsWith('http') ? (
    <a className="group flex items-center gap-3" href={href}>
      {content}
    </a>
  ) : (
    <Link className="group flex items-center gap-3" to={href}>
      {content}
    </Link>
  );
}

function PublicNavBar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-secondary-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLink href="/" label="Menschlichkeit Österreich" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hauptnavigation">
          <LocalNavLink to="/">Start</LocalNavLink>
          <LocalNavLink to="/themen">Themen</LocalNavLink>
          <LocalNavLink to="/veranstaltungen">Veranstaltungen</LocalNavLink>
          <LocalNavLink to="/blog">Blog</LocalNavLink>
          <LocalNavLink to="/forum">Forum</LocalNavLink>
          <LocalNavLink to="/spiel">Demokratiespiel</LocalNavLink>
          <LocalNavLink to="/mitglied-werden">Mitglied werden</LocalNavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ExternalNavLink href={buildPortalUrl('/login')} subtle>
            Portal-Login
          </ExternalNavLink>
          <LocalNavLink to="/spenden">Spenden</LocalNavLink>
        </div>

        <button
          className="rounded-lg p-2 text-secondary-700 hover:bg-secondary-50 md:hidden"
          onClick={() => setMobileOpen(value => !value)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Navigation schließen' : 'Navigation öffnen'}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-secondary-100 bg-white px-4 py-3 md:hidden" aria-label="Mobile Navigation">
          <div className="flex flex-col gap-1">
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/">Start</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/themen">Themen</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/veranstaltungen">Veranstaltungen</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/blog">Blog</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/forum">Forum</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/spiel">Demokratiespiel</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/mitglied-werden">Mitglied werden</LocalNavLink>
            <a
              className="rounded-full px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
              href={buildPortalUrl('/login')}
            >
              Portal-Login
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function PortalNavBar() {
  const { token, logout, hasBackofficeAccess } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function handleLogout() {
    logout();
    window.location.assign('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-secondary-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLink href={buildPublicUrl('/')} label="CRM-Portal" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Portalnavigation">
          <LocalNavLink to="/member">Profil</LocalNavLink>
          <LocalNavLink to="/member/dashboard">Übersicht</LocalNavLink>
          <LocalNavLink to="/member/rechnungen">Rechnungen</LocalNavLink>
          <LocalNavLink to="/member/newsletter">Newsletter</LocalNavLink>
          <LocalNavLink to="/member/datenschutz">Datenschutz</LocalNavLink>
          {hasBackofficeAccess && <LocalNavLink to="/admin">Backoffice</LocalNavLink>}
          {hasBackofficeAccess && <LocalNavLink to="/admin/community">Community</LocalNavLink>}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ExternalNavLink href={buildPublicUrl('/')} subtle>
            Zur Website
          </ExternalNavLink>
          {token ? (
            <button
              className="rounded-full bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <LocalNavLink to="/login">Login</LocalNavLink>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-secondary-700 hover:bg-secondary-50 md:hidden"
          onClick={() => setMobileOpen(value => !value)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Navigation schließen' : 'Navigation öffnen'}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-secondary-100 bg-white px-4 py-3 md:hidden" aria-label="Mobile Portalnavigation">
          <div className="flex flex-col gap-1">
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/member">Profil</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/member/dashboard">Übersicht</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/member/rechnungen">Rechnungen</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/member/newsletter">Newsletter</LocalNavLink>
            <LocalNavLink onClick={() => setMobileOpen(false)} to="/member/datenschutz">Datenschutz</LocalNavLink>
            {hasBackofficeAccess && (
              <>
                <LocalNavLink onClick={() => setMobileOpen(false)} to="/admin">Backoffice</LocalNavLink>
                <LocalNavLink onClick={() => setMobileOpen(false)} to="/admin/community">Community</LocalNavLink>
              </>
            )}
            <a
              className="rounded-full px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
              href={buildPublicUrl('/')}
            >
              Zur Website
            </a>
            {token && (
              <button
                className="rounded-full px-3 py-2 text-left text-sm font-medium text-primary-700 hover:bg-primary-50"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default function NavBar() {
  const location = useLocation();
  const portalHost = isPortalHost();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return portalHost ? <PortalNavBar /> : <PublicNavBar />;
}
