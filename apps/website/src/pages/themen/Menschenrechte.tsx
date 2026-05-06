import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';
import JsonLdFaq from '../../components/seo/JsonLdFaq';
import JsonLdBreadcrumb from '../../components/seo/JsonLdBreadcrumb';

const FAQ = [
  {
    frage: 'Welche Menschenrechte sind in Österreich besonders relevant?',
    antwort:
      'Österreich ist an die Europäische Menschenrechtskonvention (EMRK) gebunden und hat zahlreiche UN-Menschenrechtskonventionen ratifiziert. Besonders bedeutsam sind das Recht auf Würde, Gleichheit vor dem Gesetz, Meinungsfreiheit und der Schutz vor Diskriminierung.',
  },
  {
    frage: 'Wie setzt sich Menschlichkeit Österreich für Menschenrechte ein?',
    antwort:
      'Wir informieren über Menschenrechte durch Bildungsangebote und Materialien, organisieren Veranstaltungen zu aktuellen Menschenrechtsthemen und schaffen eine Plattform für den gesellschaftlichen Austausch.',
  },
  {
    frage: 'Wo kann ich Menschenrechtsverletzungen in Österreich melden?',
    antwort:
      'Für konkrete Rechtsfragen empfehlen wir sich an die Volksanwaltschaft Österreich, die Gleichbehandlungsanwaltschaft oder spezialisierte Rechtsberatungsstellen zu wenden. Wir bieten keine Rechtsberatung an, unterstützen aber bei der Orientierung.',
  },
];

export default function MenschenrechtePage() {
  return (
    <div>
      <SeoHead
        title="Menschenrechte – Würde &amp; Gleichheit für alle in Österreich"
        description="Menschenrechte in Österreich: Bildung, Engagement und Informationen zu universellen Menschenrechten. Menschlichkeit Österreich setzt sich für Würde und Gleichheit ein."
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Themen', url: 'https://www.menschlichkeit-oesterreich.at/themen' },
        { name: 'Menschenrechte', url: 'https://www.menschlichkeit-oesterreich.at/themen/menschenrechte' },
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
            <li className="text-gray-900 font-medium" aria-current="page">Menschenrechte</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 to-red-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="text-4xl mb-4 block">⚖️</span>
          <h1 className="text-4xl font-bold mb-4">Menschenrechte</h1>
          <p className="text-xl text-white/80">
            Universelle Menschenrechte verteidigen, Diskriminierung bekämpfen und die Würde aller Menschen schützen.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14 space-y-12">

        <section>
          <h2 className="text-2xl font-bold mb-4">Menschenrechte als Fundament einer gerechten Gesellschaft</h2>
          <div className="prose prose-lg text-gray-700">
            <p>
              Menschenrechte sind unveräußerlich, unteilbar und universal. Sie gelten für alle Menschen,
              unabhängig von Herkunft, Geschlecht, Religion oder sozialem Status. In Österreich sind diese
              Rechte durch die Verfassung und internationale Abkommen verankert – dennoch müssen sie
              täglich gelebt und verteidigt werden.
            </p>
            <p>
              Menschlichkeit Österreich versteht Menschenrechte nicht als abstrakte juristische Texte,
              sondern als gelebte Praxis. Wir setzen uns dafür ein, dass Menschenrechte in Österreich
              bekannt, respektiert und eingefordert werden können.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Unsere Schwerpunkte</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🛡️', title: 'Anti-Diskriminierung', desc: 'Schutz vor Diskriminierung aufgrund von Herkunft, Geschlecht oder Religion.' },
              { icon: '📖', title: 'Bildung & Information', desc: 'Menschenrechtsbildung für alle Altersgruppen und Hintergründe.' },
              { icon: '🌍', title: 'Internationale Solidarität', desc: 'Verknüpfung lokaler Themen mit globalen Menschenrechtsherausforderungen.' },
              { icon: '🗣️', title: 'Öffentliche Diskussion', desc: 'Menschenrechtsthemen in den gesellschaftlichen Dialog bringen.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-red-50 rounded-lg p-5">
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
            <Link to="/themen/soziale-gerechtigkeit" className="bg-orange-50 border border-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
              🤝 Soziale Gerechtigkeit
            </Link>
          </div>
        </section>

        <section className="bg-red-50 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Stärken Sie den Menschenrechtsschutz in Österreich</h2>
          <p className="text-gray-600 mb-5">Werden Sie Mitglied oder unterstützen Sie uns mit einer Spende.</p>
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
