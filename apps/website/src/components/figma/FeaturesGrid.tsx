import React from 'react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: string;
  title: string;
  description: string;
  colorClass?: string;
}

interface FeaturesGridProps {
  className?: string;
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    icon: '🤝',
    title: 'Solidarität',
    description: 'Zusammenhalt statt Spaltung – wir stehen füreinander ein und unterstützen uns gegenseitig.',
    colorClass: 'text-blue-600 bg-blue-50',
  },
  {
    icon: '⚖️',
    title: 'Soziale Gerechtigkeit',
    description: 'Chancengleichheit und faire Teilhabe für alle Menschen in Österreich, unabhängig von Herkunft.',
    colorClass: 'text-purple-600 bg-purple-50',
  },
  {
    icon: '🌱',
    title: 'Klimaschutz',
    description: 'Nachhaltigkeit und ökologische Verantwortung für künftige Generationen – jetzt handeln.',
    colorClass: 'text-green-600 bg-green-50',
  },
  {
    icon: '🏛️',
    title: 'Demokratie',
    description: 'Stärkung demokratischer Werte, Rechtsstaatlichkeit und gesellschaftlicher Teilhabe.',
    colorClass: 'text-amber-600 bg-amber-50',
  },
  {
    icon: '❤️',
    title: 'Menschenwürde',
    description: 'Uneingeschränkter Einsatz für die Würde jedes Menschen – ohne Ausnahme.',
    colorClass: 'text-red-600 bg-red-50',
  },
  {
    icon: '🌍',
    title: 'Gemeinschaft',
    description: 'Wir bauen eine Bewegung auf, die Österreich zusammenbringt und niemanden zurücklässt.',
    colorClass: 'text-teal-600 bg-teal-50',
  },
];

/**
 * Features Grid Component
 * Generated from Figma: mTlUSy9BQk4326cvwNa8zQ
 * Node ID: 1:3
 */
export function FeaturesGrid({
  className,
  title = 'Unsere Werte',
  subtitle = 'Die Grundprinzipien unseres Handelns',
  features = defaultFeatures,
}: FeaturesGridProps) {
  return (
    <section
      className={cn('py-16 bg-gray-50', className)}
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-500 max-w-xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl',
                  feature.colorClass ?? 'text-primary-600 bg-primary-50'
                )}
                aria-hidden="true"
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

FeaturesGrid.displayName = 'FeaturesGrid';

export default FeaturesGrid;
