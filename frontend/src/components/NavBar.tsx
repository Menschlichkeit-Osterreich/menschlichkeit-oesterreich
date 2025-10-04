import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to;
  const base = 'px-3 py-2 rounded transition-colors';
  const activeCls = 'bg-primary-50 text-primary-700 ring-1 ring-primary-200';
  const idleCls = 'text-secondary-800 hover:bg-secondary-50';
  return (
    <Link to={to} className={[base, active ? activeCls : idleCls].join(' ')} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  );
}

export default function NavBar() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
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
      if (!menuOpen) return;
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-3 h-12 flex items-center justify-between">
        <nav className="flex items-center gap-1">
          <NavLink to="/home">Home</NavLink>
          {token && <NavLink to="/member">Mitgliederbereich</NavLink>}
          {token && <NavLink to="/account/privacy">Datenschutz</NavLink>}
        </nav>
        <div className="relative flex items-center gap-2" ref={menuRef}>
          {!token && (
            <Link to="/Login" className="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">
              Login
            </Link>
          )}
          {token && (
            <>
              <button
                className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                Konto
                <span className="ml-1">▾</span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-10 w-48 rounded border bg-white shadow-lg divide-y"
                >
                  <div className="py-1" role="none">
                    <Link role="menuitem" className="block px-3 py-2 hover:bg-secondary-50" to="/member" onClick={() => setMenuOpen(false)}>
                      Mitgliederbereich
                    </Link>
                    <Link role="menuitem" className="block px-3 py-2 hover:bg-secondary-50" to="/account/privacy" onClick={() => setMenuOpen(false)}>
                      Datenschutz
                    </Link>
                  </div>
                  <div className="py-1" role="none">
                    <button
                      role="menuitem"
                      className="w-full text-left px-3 py-2 hover:bg-secondary-50 text-error-700"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
