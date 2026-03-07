import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
}

/**
 * Hero Section Component
 * Generated from Figma: mTlUSy9BQk4326cvwNa8zQ
 * Node ID: 1:2
 */
export function HeroSection({
  className,
  title = '„Ein Österreich, das niemanden zurücklässt."',
  subtitle = 'Menschlichkeit ist Pflicht, nicht Kür.',
  description = 'Wir stehen kompromisslos für eine solidarische, gerechte und ökologisch verantwortungsvolle Gesellschaft.',
  primaryCta = { label: 'Jetzt Mitglied werden', to: '/mitglied-werden' },
  secondaryCta = { label: 'Mehr erfahren', to: '/ueber-uns' },
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative min-h-screen flex items-center justify-center text-white',
        'bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900',
        className
      )}
      aria-labelledby="hero-heading"
    >
      {/* Background overlay pattern */}
      <div
        className="absolute inset-0 opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            {title}
          </h1>

          {subtitle && (
            <p className="text-xl md:text-2xl font-semibold mb-4 text-white/90">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-lg mb-8 text-white/75 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={primaryCta.to}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
            >
              <span aria-hidden="true">🤝</span>
              {primaryCta.label}
            </Link>
            <Link
              to={secondaryCta.to}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-lg hover:border-white hover:bg-white/10 transition-colors"
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

HeroSection.displayName = 'HeroSection';

export default HeroSection;
