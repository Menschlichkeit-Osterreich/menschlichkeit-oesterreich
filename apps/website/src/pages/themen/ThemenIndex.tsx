import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';

const THEMEN = [
  {
    slug: '/themen/demokratie',
    title: 'Demokratie',
    icon: '🗳️',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100',
    desc: 'Demokratische Teilhabe stärken, politische Bildung fördern und Rechtsstaatlichkeit schützen.',
  },
  {
    slug: '/themen/menschenrechte',
    title: 'Menschenrechte',
    icon: '⚖️',
    color: 'bg-red-50 border-red-100',
    iconBg: 'bg-red-100',
    desc: 'Universelle Menschenrechte verteidigen, Diskriminierung bekämpfen, Würde schützen.',
  },
  {
    slug: '/themen/soziale-gerechtigkeit',
    title: 'Soziale Gerechtigkeit',
    icon: '🤝',
    color: 'bg-orange-50 border-orange-100',
    iconBg: 'bg-orange-100',
    desc: 'Chancengleichheit, fairer Zugang zu Bildung und Gesundheit, Armutsbekämpfung in Österreich.',
  },
];

export default function ThemenIndex() {
  return (
    <div>
      <SeoHead
        title="Themen – Demokratie, Menschenrechte &amp; Soziale Gerechtigkeit"
        description="Die Themenschwerpunkte von Menschlichkeit Österreich: Demokratie, Menschenrechte und Soziale Gerechtigkeit. Informieren Sie sich und engagieren Sie sich."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Unsere Themen</h1>
          <p className="text-xl text-white/80">
            Wir setzen uns für eine gerechte, demokratische und offene Gesellschaft in Österreich ein.
            Erfahren Sie mehr über unsere inhaltlichen Schwerpunkte.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {THEMEN.map((thema) => (
              <Link
                key={thema.slug}
                to={thema.slug}
                className={`block rounded-xl border p-6 hover:shadow-md transition-shadow ${thema.color}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${thema.iconBg}`}>
                  <span className="text-2xl">{thema.icon}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-900">{thema.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{thema.desc}</p>
                <span className="inline-block mt-4 text-primary-600 font-medium text-sm">Mehr erfahren →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links to related content */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Aktiv werden</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/bildung" className="bg-white border border-gray-200 rounded-lg px-5 py-3 text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors">
              📚 Bildungsangebote
            </Link>
            <Link to="/veranstaltungen" className="bg-white border border-gray-200 rounded-lg px-5 py-3 text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors">
              📅 Veranstaltungen
            </Link>
            <Link to="/mitglied-werden" className="bg-white border border-gray-200 rounded-lg px-5 py-3 text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors">
              ✨ Mitglied werden
            </Link>
            <Link to="/spenden" className="bg-white border border-gray-200 rounded-lg px-5 py-3 text-gray-700 hover:border-primary-300 hover:text-primary-700 transition-colors">
              💙 Jetzt spenden
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
