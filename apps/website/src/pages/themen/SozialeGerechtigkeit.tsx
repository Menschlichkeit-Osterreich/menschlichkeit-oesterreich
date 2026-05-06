import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';
import JsonLdFaq from '../../components/seo/JsonLdFaq';
import JsonLdBreadcrumb from '../../components/seo/JsonLdBreadcrumb';

const FAQ = [
  {
    frage: 'Was bedeutet soziale Gerechtigkeit in Österreich konkret?',
    antwort:
      'Soziale Gerechtigkeit bedeutet, dass alle Menschen in Österreich gleiche Chancen auf Bildung, Arbeit, Gesundheitsversorgung und gesellschaftliche Teilhabe haben – unabhängig von ihrer sozialen Herkunft, ihrem Einkommen oder anderen Faktoren.',
  },
  {
    frage: 'Wie engagiert sich Menschlichkeit Österreich für soziale Gerechtigkeit?',
    antwort:
      'Wir informieren über strukturelle Ungleichheiten, bieten Bildungsangebote an, schaffen Vernetzungsmöglichkeiten für sozial Engagierte und setzen uns für politische Maßnahmen ein, die Chancengleichheit fördern.',
  },
  {
    frage: 'Wie kann ich soziale Projekte in Österreich unterstützen?',
    antwort:
      'Sie können sich als Mitglied einbringen, ehrenamtlich aktiv werden, an unseren Veranstaltungen teilnehmen oder mit einer Spende unsere Bildungsarbeit unterstützen.',
  },
];

export default function SozialeGerechtigkeitPage() {
  return (
    <div>
      <SeoHead
        title="Soziale Gerechtigkeit – Chancengleichheit in Österreich"
        description="Soziale Gerechtigkeit in Österreich: Chancengleichheit, fairer Zugang zu Bildung und Gesundheit, Armutsbekämpfung. Engagement von Menschlichkeit Österreich."
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Themen', url: 'https://www.menschlichkeit-oesterreich.at/themen' },
        { name: 'Soziale Gerechtigkeit', url: 'https://www.menschlichkeit-oesterreich.at/themen/soziale-gerechtigkeit' },
      ]} />
      <JsonLdFaq items={FAQ.map(({ frage, antwort }) => ({ question: frage, answer: antwort }))} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3 text-sm">
          <ol className="flex items-center gap-2 text-gray-500">
            <li><Link to="/" className="hover:text-primary-600">Start</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/themen" className="hover:text-primary-600">Themen</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Soziale Gerechtigkeit</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="text-4xl mb-4 block">🤝</span>
          <h1 className="text-4xl font-bold mb-4">Soziale Gerechtigkeit</h1>
          <p className="text-xl text-white/80">
            Chancengleichheit und faire Teilhabe für alle Menschen in Österreich – niemanden zurücklassen.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14 space-y-12">

        <section>
          <h2 className="text-2xl font-bold mb-4">Warum soziale Gerechtigkeit unser aller Thema ist</h2>
          <div className="prose prose-lg text-gray-700">
            <p>
              In Österreich bestimmt die soziale Herkunft noch immer stark, welche Chancen Menschen
              im Leben haben. Trotz eines gut ausgebauten Sozialsystems gibt es erhebliche Unterschiede
              beim Zugang zu hochwertiger Bildung, stabiler Beschäftigung und guter Gesundheitsversorgung.
            </p>
            <p>
              Menschlichkeit Österreich versteht soziale Gerechtigkeit als Voraussetzung für eine
              funktionierende Demokratie. Menschen, die sich um existenzielle Fragen sorgen müssen,
              können weniger an gesellschaftlichen Prozessen teilnehmen. Deshalb gehören soziale
              Gerechtigkeit und demokratische Teilhabe untrennbar zusammen.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Unsere Schwerpunkte</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🎓', title: 'Bildungsgerechtigkeit', desc: 'Gleicher Zugang zu hochwertiger Bildung für alle Kinder und Jugendlichen.' },
              { icon: '🏥', title: 'Gesundheitliche Teilhabe', desc: 'Zugang zu Gesundheitsversorgung unabhängig vom Einkommen.' },
              { icon: '💼', title: 'Arbeitsmarkt & Würde', desc: 'Faire Arbeitsbedingungen und existenzsichernde Einkommen.' },
              { icon: '🏘️', title: 'Gemeinschaft & Zusammenhalt', desc: 'Starke Nachbarschaften und gegenseitige Unterstützung.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-orange-50 rounded-lg p-5">
                <span className="text-2xl mb-2 block">{icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Häufig gestellte Fragen</h2>
          <div className="space-y-4">
            {FAQ.map(({ frage, antwort }) => (
              <details key={frage} className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <summary className="px-5 py-4 font-medium text-gray-900 cursor-pointer hover:text-primary-700">
                  {frage}
                </summary>
                <div className="px-5 pb-4 text-gray-600 leading-relaxed">{antwort}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Verwandte Themen</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/themen/demokratie" className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              🗳️ Demokratie
            </Link>
            <Link to="/themen/menschenrechte" className="bg-red-50 border border-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
              ⚖️ Menschenrechte
            </Link>
          </div>
        </section>

        <section className="bg-orange-50 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Gemeinsam für ein gerechtes Österreich</h2>
          <p className="text-gray-600 mb-5">Engagieren Sie sich und unterstützen Sie unsere Arbeit für soziale Gerechtigkeit.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/mitglied-werden" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Mitglied werden
            </Link>
            <Link to="/spenden" className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Jetzt spenden
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
