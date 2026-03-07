import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to || (to === '/' && location.pathname === '/home');
  const base = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const activeCls = 'bg-primary-50 text-primary-700 ring-1 ring-primary-200';
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
      <NavLink to="/statuten">Statuten</NavLink>
      <NavLink to="/beitragsordnung">Beitragsordnung</NavLink>
      {token && <NavLink to="/member">Mitgliederbereich</NavLink>}
      {token && isAdmin && <NavLink to="/admin/queue">Admin</NavLink>}
    </>
  );

  return (
    <header className="border-b bg-white sticky top-0 z-20 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-primary-700 hover:text-primary-800 shrink-0 mr-4"
          aria-label="Menschlichkeit Österreich – Startseite"
        >
          <span className="text-xl" aria-hidden="true">🤝</span>
          <span className="hidden lg:inline">Menschlichkeit Österreich</span>
          <span className="lg:hidden font-semibold text-sm">MÖ</span>
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
              className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors hidden md:inline-flex"
            >
              Login
            </Link>
          )}

          {token && (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-secondary-200 text-sm text-secondary-800 hover:bg-secondary-50 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                Konto
                <span aria-hidden="true" className={`ml-1 transition-transform inline-block ${menuOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-10 w-52 rounded-lg border border-secondary-200 bg-white shadow-lg divide-y divide-secondary-100 z-30"
                >
                  <div className="py-1" role="none">
                    <Link role="menuitem" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary-50 transition-colors" to="/member" onClick={() => setMenuOpen(false)}>
                      <span aria-hidden="true">👤</span> Mitgliederbereich
                    </Link>
                    <Link role="menuitem" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary-50 transition-colors" to="/member/dashboard" onClick={() => setMenuOpen(false)}>
                      <span aria-hidden="true">📊</span> Dashboard
                    </Link>
                    <Link role="menuitem" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary-50 transition-colors" to="/account/privacy" onClick={() => setMenuOpen(false)}>
                      <span aria-hidden="true">🔒</span> Datenschutz
                    </Link>
                    {isAdmin && (
                      <Link role="menuitem" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary-50 transition-colors" to="/admin/queue" onClick={() => setMenuOpen(false)}>
                        <span aria-hidden="true">⚙️</span> Admin
                      </Link>
                    )}
                  </div>
                  <div className="py-1" role="none">
                    <button
                      role="menuitem"
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error-700 hover:bg-secondary-50 transition-colors"
                      onClick={() => { setMenuOpen(false); logout(); }}
                    >
                      <span aria-hidden="true">↩</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-secondary-700 hover:bg-secondary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
          {token && (
            <NavLink to="/account/privacy">Datenschutz</NavLink>
          )}
          {token && (
            <button
              className="text-left px-3 py-2 rounded-md text-sm font-medium text-error-700 hover:bg-secondary-50 transition-colors"
              onClick={() => { setMobileOpen(false); logout(); }}
            >
              Logout
            </button>
          )}
          {!token && (
            <Link
              to="/Login"
              className="px-3 py-2 rounded-md text-sm bg-primary-600 text-white font-medium hover:bg-primary-700 text-center transition-colors"
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
