import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to || (to === '/' && location.pathname === '/home');
  const base = 'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150';
  const activeCls = 'bg-primary-50 text-primary-700 font-semibold';
  const idleCls = 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900';
  return (
    <Link
      to={to}
      className={[base, active ? activeCls : idleCls].join(' ')}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

export default function NavBar() {
  const { token, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuOpen) return;
      const el = menuRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const coreNavLinks = (
    <>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/mitglied-werden">Mitglied werden</NavLink>
      <NavLink to="/spenden">Spenden</NavLink>
      <NavLink to="/spiel">Demokratiespiel</NavLink>
      <NavLink to="/statuten">Statuten</NavLink>
      <NavLink to="/beitragsordnung">Beitragsordnung</NavLink>
      {token && <NavLink to="/member">Mitgliederbereich</NavLink>}
      {token && isAdmin && <NavLink to="/admin/queue">Admin</NavLink>}
    </>
  );

  return (
    <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-secondary-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand with Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0 group"
          aria-label="Menschlichkeit Österreich – Startseite"
        >
          <img
            src="/logo.jpg"
            alt="Verein Menschlichkeit Österreich"
            className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all"
          />
          <div className="hidden sm:block">
            <span className="block text-xs font-medium text-secondary-400 leading-none uppercase tracking-wider">Verein</span>
            <span className="block text-base font-bold text-secondary-900 group-hover:text-primary-700 transition-colors leading-tight">
              Menschlichkeit Österreich
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Hauptnavigation">
          {coreNavLinks}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {!token && (
            <Link
              to="/Login"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-all shadow-sm hover:shadow hidden md:inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Login
            </Link>
          )}

          {token && (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-secondary-200 text-sm text-secondary-800 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <svg className="w-4 h-4 text-secondary-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Konto
                <svg className={`w-3.5 h-3.5 text-secondary-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-11 w-56 rounded-xl border border-secondary-200 bg-white shadow-xl divide-y divide-secondary-100 z-30 overflow-hidden"
                >
                  <div className="py-1.5" role="none">
                    <Link role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors" to="/member" onClick={() => setMenuOpen(false)}>
                      <span aria-hidden="true" className="text-base">👤</span> Mitgliederbereich
                    </Link>
                    <Link role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors" to="/member/dashboard" onClick={() => setMenuOpen(false)}>
                      <span aria-hidden="true" className="text-base">📊</span> Dashboard
                    </Link>
                    <Link role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors" to="/account/privacy" onClick={() => setMenuOpen(false)}>
                      <span aria-hidden="true" className="text-base">🔒</span> Datenschutz
                    </Link>
                    {isAdmin && (
                      <Link role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors" to="/admin/queue" onClick={() => setMenuOpen(false)}>
                        <span aria-hidden="true" className="text-base">⚙️</span> Admin
                      </Link>
                    )}
                  </div>
                  <div className="py-1.5" role="none">
                    <button
                      role="menuitem"
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => { setMenuOpen(false); logout(); }}
                    >
                      <span aria-hidden="true" className="text-base">↩</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-secondary-700 hover:bg-secondary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Navigation schließen' : 'Navigation öffnen'}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              {mobileOpen
                ? <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                : <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-secondary-100 bg-white px-4 py-3 flex flex-col gap-1"
          aria-label="Mobile Navigation"
        >
          {coreNavLinks}
          {token && <NavLink to="/account/privacy">Datenschutz</NavLink>}
          {token && (
            <button
              className="text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => { setMobileOpen(false); logout(); }}
            >
              Logout
            </button>
          )}
          {!token && (
            <Link
              to="/Login"
              className="mt-1 px-3 py-2.5 rounded-lg text-sm bg-primary-600 text-white font-semibold hover:bg-primary-700 text-center transition-colors shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
