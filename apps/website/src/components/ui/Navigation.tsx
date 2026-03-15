import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from './Button';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Über uns',
    href: '/ueber-uns',
    children: [
      { label: 'Über den Verein', href: '/ueber-uns', description: 'Geschichte, Mission und Vision' },
      { label: 'Unser Team', href: '/team', description: 'Vorstand und Mitarbeiter' },
      { label: 'Transparenz', href: '/transparenz', description: 'Vereinsdaten, ZVR, Finanzen' },
      { label: 'Presse', href: '/presse', description: 'Medieninformationen' },
      { label: 'Statuten', href: '/statuten', description: 'Vereinsstatuten' },
      { label: 'Beitragsordnung', href: '/beitragsordnung', description: 'Mitgliedsbeiträge 2025' },
    ],
  },
  {
    label: 'Themen',
    href: '/themen',
    children: [
      { label: 'Alle Themen', href: '/themen', description: 'Übersicht unserer Schwerpunkte' },
      { label: 'Demokratie', href: '/themen/demokratie', description: 'Politische Bildung & Teilhabe' },
      { label: 'Menschenrechte', href: '/themen/menschenrechte', description: 'Würde & Gleichheit' },
      { label: 'Soziale Gerechtigkeit', href: '/themen/soziale-gerechtigkeit', description: 'Chancengleichheit' },
    ],
  },
  {
    label: 'Mitmachen',
    href: '/mitglied-werden',
    children: [
      { label: 'Mitglied werden', href: '/mitglied-werden', description: 'Jetzt beitreten' },
      { label: 'Spenden', href: '/spenden', description: 'Einmalig oder regelmäßig unterstützen' },
      { label: 'Veranstaltungen', href: '/veranstaltungen', description: 'Aktuelle Events und Termine' },
    ],
  },
  {
    label: 'Bildung',
    href: '/bildung',
    children: [
      { label: 'Bildungsangebote', href: '/bildung', description: 'Module und Kurse' },
      { label: 'Demokratiespiel', href: '/spiel', description: 'Interaktives Lernspiel' },
      { label: 'Materialien', href: '/materialien', description: 'Unterrichtsmaterialien' },
    ],
  },
  { label: 'Kontakt', href: '/kontakt' },
];

function DropdownMenu({ items, isOpen }: { items: NonNullable<NavItem['children']>; isOpen: boolean }) {
  return (
    <div
      className={`absolute left-0 top-full mt-2 w-72 rounded-xl bg-white shadow-xl ring-1 ring-secondary-200 z-50 transition-all duration-150 ${
        isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
      role="menu"
    >
      <div className="p-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            role="menuitem"
            className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 hover:bg-primary-50 transition-colors group"
          >
            <span className="text-sm font-medium text-secondary-900 group-hover:text-primary-700">{item.label}</span>
            {item.description && (
              <span className="text-xs text-secondary-500">{item.description}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

export function Navigation() {
  const { token, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-secondary-200 bg-white/95 backdrop-blur-sm">
      <nav ref={navRef} className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16" aria-label="Hauptnavigation">
        <a href="/" className="flex items-center gap-2 shrink-0" aria-label="Menschlichkeit Österreich – Startseite">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="hidden sm:block font-semibold text-secondary-900 text-sm leading-tight">
            Menschlichkeit<br /><span className="text-primary-600">Österreich</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className="relative">
              {item.children ? (
                <>
                  <button
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeDropdown === item.href ? 'bg-primary-50 text-primary-700' : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                    onClick={() => setActiveDropdown(activeDropdown === item.href ? null : item.href)}
                    aria-expanded={activeDropdown === item.href}
                    aria-haspopup="menu"
                  >
                    {item.label}
                    <svg className={`w-4 h-4 transition-transform ${activeDropdown === item.href ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <DropdownMenu items={item.children} isOpen={activeDropdown === item.href} />
                </>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
            aria-label={isDark ? 'Helles Design' : 'Dunkles Design'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {token ? (
            <div className="flex items-center gap-2">
              <NavLink to="/member" className="text-sm text-secondary-700 hover:text-primary-600 font-medium">Mein Bereich</NavLink>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="text-sm text-secondary-700 hover:text-primary-600 font-medium">Login</NavLink>
              <Button size="sm" onClick={() => window.location.href = '/mitglied-werden'}>Mitglied werden</Button>
            </div>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-secondary-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.href}>
                <a href={item.href} className="block px-3 py-2 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50">
                  {item.label}
                </a>
                {item.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <a key={child.href} href={child.href} className="block px-3 py-1.5 rounded-lg text-sm text-secondary-600 hover:bg-secondary-50">
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-secondary-200 flex flex-col gap-2">
              {token ? (
                <>
                  <NavLink to="/member" className="block px-3 py-2 text-sm font-medium text-primary-600">Mein Bereich</NavLink>
                  <Button variant="secondary" size="sm" onClick={logout} className="w-full">Logout</Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="block px-3 py-2 text-sm font-medium text-secondary-700">Login</NavLink>
                  <Button size="sm" className="w-full" onClick={() => window.location.href = '/mitglied-werden'}>Mitglied werden</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
