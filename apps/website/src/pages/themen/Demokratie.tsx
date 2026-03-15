import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';
import JsonLdFaq from '../../components/seo/JsonLdFaq';
import JsonLdBreadcrumb from '../../components/seo/JsonLdBreadcrumb';

const FAQ = [
  {
    frage: 'Was versteht Menschlichkeit Österreich unter Demokratiebildung?',
    antwort:
      'Demokratiebildung bedeutet für uns, Menschen aller Altersgruppen die Funktionsweise demokratischer Institutionen näherzubringen, politische Partizipation zu fördern und kritisches Denken zu stärken. Dazu bieten wir Workshops, interaktive Materialien und unser Demokratiespiel an.',
  },
  {
    frage: 'Wie kann ich demokratisches Engagement in Österreich stärken?',
    antwort:
      'Sie können sich in zivilgesellschaftlichen Organisationen engagieren, an Veranstaltungen teilnehmen, Bildungsangebote nutzen und andere Menschen für demokratische Werte sensibilisieren. Werden Sie Mitglied und nutzen Sie unsere Community-Plattform.',
  },
  {
    frage: 'Welche Ressourcen bietet Menschlichkeit Österreich zu Demokratiethemen?',
    antwort:
      'Wir stellen kostenlose Unterrichtsmaterialien, Arbeitsblätter und Präsentationen zum Download bereit. Unser interaktives Demokratiespiel ermöglicht spielerisches Lernen für Jugendliche und Erwachsene.',
  },
];

export default function DemokratiePage() {
  return (
    <div>
      <SeoHead
        title="Demokratie – Teilhabe &amp; politische Bildung in Österreich"
        description="Demokratie stärken in Österreich: Bildungsangebote, Workshops und Ressourcen von Menschlichkeit Österreich zur Förderung demokratischer Werte und politischer Teilhabe."
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Themen', url: 'https://www.menschlichkeit-oesterreich.at/themen' },
        { name: 'Demokratie', url: 'https://www.menschlichkeit-oesterreich.at/themen/demokratie' },
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
            <li className="text-gray-900 font-medium" aria-current="page">Demokratie</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="text-4xl mb-4 block">🗳️</span>
          <h1 className="text-4xl font-bold mb-4">Demokratie</h1>
          <p className="text-xl text-white/80">
            Aktive Mitgestaltung und Stärkung demokratischer Teilhabe auf allen Ebenen der Gesellschaft.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14 space-y-12">

        {/* Warum Demokratie */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Warum Demokratie uns alle angeht</h2>
          <div className="prose prose-lg text-gray-700">
            <p>
              Demokratie ist kein Selbstläufer. Sie lebt vom Engagement der Bürgerinnen und Bürger,
              von informierten Entscheidungen und von einer aktiven Zivilgesellschaft. In einer Zeit,
              in der demokratische Institutionen und Werte unter Druck geraten, ist politische Bildung
              wichtiger denn je.
            </p>
            <p>
              Menschlichkeit Österreich setzt sich dafür ein, dass alle Menschen in Österreich –
              unabhängig von Herkunft, Bildungsstand oder Alter – die Möglichkeit haben, demokratische
              Prozesse zu verstehen und daran teilzunehmen. Denn eine starke Demokratie braucht starke,
              informierte und engagierte Menschen.
            </p>
          </div>
        </section>

        {/* Unsere Aktivitäten */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Unsere Aktivitäten</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🎮', title: 'Demokratiespiel', desc: 'Interaktives Lernspiel für alle Altersgruppen', link: '/spiel' },
              { icon: '📚', title: 'Bildungsmodule', desc: 'Strukturierte Lerneinheiten zu demokratischen Themen', link: '/bildung' },
              { icon: '📄', title: 'Materialien', desc: 'Kostenlose Arbeitsblätter und Präsentationen', link: '/materialien' },
              { icon: '📅', title: 'Workshops', desc: 'Praktische Veranstaltungen und Diskussionen', link: '/veranstaltungen' },
            ].map(({ icon, title, desc, link }) => (
              <Link key={title} to={link} className="bg-blue-50 rounded-lg p-5 hover:bg-blue-100 transition-colors">
                <span className="text-2xl mb-2 block">{icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
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

        {/* Verwandte Themen */}
        <section className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Verwandte Themen</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/themen/menschenrechte" className="bg-red-50 border border-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
              ⚖️ Menschenrechte
            </Link>
            <Link to="/themen/soziale-gerechtigkeit" className="bg-orange-50 border border-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
              🤝 Soziale Gerechtigkeit
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-50 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Demokratie aktiv gestalten</h2>
          <p className="text-gray-600 mb-5">Werden Sie Teil unserer Gemeinschaft und engagieren Sie sich für demokratische Werte in Österreich.</p>
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
