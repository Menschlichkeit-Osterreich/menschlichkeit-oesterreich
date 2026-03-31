import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../auth/AuthContext';
import { buildPublicUrl } from '../utils/runtimeHost';

interface SideNavItem {
  to: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const MEMBER_NAV: SideNavItem[] = [
  { to: '/member/dashboard', label: 'Übersicht', icon: '🏠' },
  { to: '/member', label: 'Mein Profil', icon: '👤', exact: true },
  { to: '/member/rechnungen', label: 'Rechnungen & Belege', icon: '🧾' },
  { to: '/member/sepa', label: 'SEPA-Mandat', icon: '🏦' },
  { to: '/member/newsletter', label: 'Newsletter', icon: '📧' },
  { to: '/member/datenschutz', label: 'Datenschutz', icon: '🔒' },
  { to: '/member/onboarding', label: 'Onboarding', icon: '🎯' },
];

const ADMIN_NAV: SideNavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/members', label: 'CRM & Mitglieder', icon: '👥' },
  { to: '/admin/queue', label: 'Anfragen', icon: '📋' },
  { to: '/admin/finanzen', label: 'Finanzen', icon: '💰' },
  { to: '/admin/events', label: 'Veranstaltungen', icon: '📅' },
  { to: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { to: '/admin/community', label: 'Blog & Forum', icon: '📰' },
  { to: '/admin/dsgvo', label: 'DSGVO', icon: '🔒' },
  { to: '/admin/reports', label: 'Berichte', icon: '📈' },
  { to: '/admin/settings', label: 'Einstellungen', icon: '⚙️' },
  { to: '/admin/openclaw', label: 'OpenClaw', icon: '🤖' },
];

function SideNav({ items }: { items: SideNavItem[] }) {
  const location = useLocation();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Bereichsnavigation">
      {items.map((item) => {
        const active = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? 'page' : undefined}
            className={[
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              active
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900',
            ].join(' ')}
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout() {
  const { hasBackofficeAccess } = useAuth();
  const navItems = hasBackofficeAccess ? ADMIN_NAV : MEMBER_NAV;
  const areaLabel = hasBackofficeAccess ? 'Backoffice' : 'Mitgliederbereich';
  const areaIcon = hasBackofficeAccess ? '⚙️' : '👤';

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <NavBar />
      <div className="flex flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0" aria-label="Seitennavigation">
          <div className="sticky top-20">
            {/* Area header */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="text-lg" aria-hidden="true">{areaIcon}</span>
              <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{areaLabel}</span>
            </div>
            <SideNav items={navItems} />

            {/* Bottom links */}
            <div className="mt-6 pt-4 border-t border-secondary-200">
              <a
                href={buildPublicUrl('/')}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary-500 transition-all hover:bg-secondary-50 hover:text-secondary-700"
              >
                <span aria-hidden="true">←</span> Zur Website
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main id="main" className="flex-1 min-w-0" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
