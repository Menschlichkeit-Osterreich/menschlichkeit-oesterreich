import React from 'react';
import { Link } from 'react-router-dom';

interface SpendenCTAProps {
  /** Heading text */
  heading?: string;
  /** Body text */
  body?: string;
  /** Show ZVR trust signal */
  showTrust?: boolean;
  /** Visual variant */
  variant?: 'primary' | 'subtle';
}

/**
 * Reusable donation + membership CTA module.
 * Use on content pages to create visible conversion paths.
 *
 * E-E-A-T: includes ZVR trust signal by default.
 */
export default function SpendenCTA({
  heading = 'Unterstützen Sie unsere Arbeit',
  body = 'Mit Ihrer Spende oder Mitgliedschaft ermöglichen Sie Bildungsangebote, Veranstaltungen und das Engagement für Demokratie und Menschenrechte in Österreich.',
  showTrust = true,
  variant = 'primary',
}: SpendenCTAProps) {
  const bgClass =
    variant === 'primary'
      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
      : 'bg-primary-50 border border-primary-100';

  const textClass = variant === 'primary' ? 'text-white/90' : 'text-gray-600';
  const headingClass = variant === 'primary' ? 'text-white' : 'text-gray-900';
  const trustClass = variant === 'primary' ? 'text-white/70' : 'text-gray-400';

  return (
    <section
      className={`rounded-xl p-8 text-center ${bgClass}`}
      aria-label="Spenden und Mitmachen"
    >
      <h2 className={`text-xl md:text-2xl font-bold mb-3 ${headingClass}`}>{heading}</h2>
      <p className={`mb-6 max-w-lg mx-auto leading-relaxed ${textClass}`}>{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/spenden"
          className={`inline-block px-6 py-3 rounded-lg font-semibold transition-colors ${
            variant === 'primary'
              ? 'bg-white text-primary-700 hover:bg-primary-50'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          Jetzt spenden
        </Link>
        <Link
          to="/mitglied-werden"
          className={`inline-block px-6 py-3 rounded-lg font-semibold transition-colors border ${
            variant === 'primary'
              ? 'border-white/60 text-white hover:bg-white/10'
              : 'border-primary-600 text-primary-600 hover:bg-primary-50'
          }`}
        >
          Mitglied werden
        </Link>
      </div>
      {showTrust && (
        <p className={`mt-5 text-xs ${trustClass}`}>
          Menschlichkeit Österreich · Gemeinnütziger Verein · ZVR: 1182213083 ·{' '}
          <Link
            to="/transparenz"
            className={`underline ${variant === 'primary' ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Transparenz
          </Link>
        </p>
      )}
    </section>
  );
}
