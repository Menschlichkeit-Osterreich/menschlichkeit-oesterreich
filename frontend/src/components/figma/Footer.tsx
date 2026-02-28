import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

/**
 * Footer Component
 * Generated from Figma: mTlUSy9BQk4326cvwNa8zQ
 * Node ID: 1:5
 */
export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn('bg-gray-900 text-white', className)}
      role="contentinfo"
      aria-label="Website-Footer"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-bold text-lg text-white hover:text-primary-300 transition-colors mb-3"
            >
              <span aria-hidden="true">❤️</span>
              Menschlichkeit Österreich
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Ein Österreich, das niemanden zurücklässt. Für eine solidarische, gerechte
              und ökologisch verantwortungsvolle Gesellschaft.
            </p>
            <p className="text-gray-500 text-xs">
              ZVR: 1182213083 · Gegründet: 28. Mai 2025 · Gemeinnützig nach BAO
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer-Navigation">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-2 list-none">
              {[
                { label: 'Startseite', to: '/' },
                { label: 'Mitglied werden', to: '/mitglied-werden' },
                { label: 'Spenden', to: '/spenden' },
                { label: 'Statuten', to: '/statuten' },
                { label: 'Beitragsordnung', to: '/beitragsordnung' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact & Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Kontakt &amp; Rechtliches
            </h3>
            <address className="not-italic text-gray-400 text-sm space-y-2 mb-4">
              <p>Pottenbrunner Hauptstraße 108/1</p>
              <p>3140 St. Pölten</p>
              <p>
                <a
                  href="mailto:menschlichkeit-oesterreich@outlook.at"
                  className="hover:text-white transition-colors"
                >
                  menschlichkeit-oesterreich@outlook.at
                </a>
              </p>
            </address>
            <ul className="space-y-2 list-none">
              {[
                { label: 'Impressum', to: '/impressum' },
                { label: 'Datenschutz', to: '/datenschutz' },
                { label: 'Datenschutz-Einstellungen', to: '/account/privacy' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {year} Menschlichkeit Österreich. Alle Rechte vorbehalten.
          </p>
          <p className="text-gray-600 text-xs">
            Mit <span aria-label="Herz">❤️</span> für eine menschlichere Gesellschaft
          </p>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';

export default Footer;
