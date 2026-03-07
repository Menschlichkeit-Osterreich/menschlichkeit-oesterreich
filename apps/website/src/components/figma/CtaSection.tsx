import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CtaSectionProps {
  className?: string;
  title?: string;
  description?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  variant?: 'primary' | 'light';
}

/**
 * CTA Section Component
 * Generated from Figma: mTlUSy9BQk4326cvwNa8zQ
 * Node ID: 1:4
 */
export function CtaSection({
  className,
  title = 'Werde Teil der Bewegung',
  description = 'Als Mitglied gestaltest du aktiv mit und stärkst die Gemeinschaft. Alle sind herzlich willkommen.',
  primaryCta = { label: 'Mitglied werden', to: '/mitglied-werden' },
  secondaryCta = { label: 'Weitere Möglichkeiten', to: '/spenden' },
  variant = 'primary',
}: CtaSectionProps) {
  const isPrimary = variant === 'primary';

  return (
    <section
      className={cn(
        'py-16',
        isPrimary
          ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-white'
          : 'bg-white',
        className
      )}
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            id="cta-heading"
            className={cn(
              'text-3xl font-bold mb-4',
              isPrimary ? 'text-white' : 'text-gray-900'
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              'text-lg mb-8',
              isPrimary ? 'text-white/80' : 'text-gray-500'
            )}
          >
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={primaryCta.to}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold rounded-lg transition-colors shadow',
                isPrimary
                  ? 'bg-white text-primary-700 hover:bg-white/90'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              <span aria-hidden="true">🤝</span>
              {primaryCta.label}
            </Link>
            <Link
              to={secondaryCta.to}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold rounded-lg border-2 transition-colors',
                isPrimary
                  ? 'border-white/40 text-white hover:border-white hover:bg-white/10'
                  : 'border-primary-300 text-primary-700 hover:bg-primary-50'
              )}
            >
              <span aria-hidden="true">ℹ️</span>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

CtaSection.displayName = 'CtaSection';

export default CtaSection;
