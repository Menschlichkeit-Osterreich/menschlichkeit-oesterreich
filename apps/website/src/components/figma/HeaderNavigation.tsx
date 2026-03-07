import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
}

interface HeaderNavigationProps {
  className?: string;
  items?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  { label: 'Startseite', to: '/' },
  { label: 'Mitglied werden', to: '/mitglied-werden' },
  { label: 'Spenden', to: '/spenden' },
  { label: 'Statuten', to: '/statuten' },
  { label: 'Beitragsordnung', to: '/beitragsordnung' },
];

/**
 * Header/Navigation Component
 * Generated from Figma: mTlUSy9BQk4326cvwNa8zQ
 * Node ID: 1:1
 */
export function HeaderNavigation({
  className,
  items = defaultNavItems,
}: HeaderNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100',
        className
      )}
      role="banner"
    >
      <nav
        className="container mx-auto px-4 h-16 flex items-center justify-between"
        aria-label="Hauptnavigation"
      >
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-primary-700 text-lg hover:text-primary-800 transition-colors"
          aria-label="Menschlichkeit Österreich – Startseite"
        >
          <span aria-hidden="true">❤️</span>
          <span className="hidden sm:inline">Menschlichkeit Österreich</span>
          <span className="sm:hidden">MÖ</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1 list-none" role="menubar">
          {items.map((item) => (
            <li key={item.to} role="none">
              <NavLink
                to={item.to}
                role="menuitem"
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                  )
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-700 hover:bg-gray-50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Navigation öffnen"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <ul className="container mx-auto px-4 py-3 flex flex-col gap-1 list-none">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                    )
                  }
                  onClick={() => setMobileOpen(false)}
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

HeaderNavigation.displayName = 'HeaderNavigation';

export default HeaderNavigation;
