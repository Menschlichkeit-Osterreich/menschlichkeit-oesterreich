import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import JsonLdPerson from '../components/seo/JsonLdPerson';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';

interface TeamMember {
  name: string;
  rolle: string;
  bio: string;
  initials: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Vorstand – Obfrau/Obmann',
    rolle: 'Vereinsvorsitz',
    bio: 'Verantwortlich für die strategische Ausrichtung des Vereins und die Vertretung nach außen.',
    initials: 'V',
  },
  {
    name: 'Kassier/in',
    rolle: 'Finanzen & Administration',
    bio: 'Zuständig für die Vereinsfinanzen, Buchführung und Mitgliederverwaltung.',
    initials: 'K',
  },
  {
    name: 'Schriftführer/in',
    rolle: 'Protokoll & Kommunikation',
    bio: 'Verantwortlich für Protokollführung, Vereinskommunikation und interne Dokumentation.',
    initials: 'S',
  },
];

export default function TeamPage() {
  return (
    <div>
      <SeoHead
        title="Unser Team – Menschlichkeit Österreich"
        description="Lernen Sie den Vorstand und das Team von Menschlichkeit Österreich kennen. Menschen, die sich für Demokratie, Menschenrechte und soziale Gerechtigkeit einsetzen."
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Über uns', url: 'https://www.menschlichkeit-oesterreich.at/ueber-uns' },
        { name: 'Team', url: 'https://www.menschlichkeit-oesterreich.at/team' },
      ]} />
      {TEAM.map((member) => (
        <JsonLdPerson
          key={member.name}
          name={member.name}
          jobTitle={member.rolle}
          description={member.bio}
          url="https://www.menschlichkeit-oesterreich.at/team"
        />
      ))}

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Unser Team</h1>
          <p className="text-xl text-white/80">
            Menschen, die sich für eine offene, gerechte Gesellschaft in Österreich engagieren.
          </p>
        </div>
      </section>

      {/* Vorstand */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-2 text-center">Vorstand</h2>
          <p className="text-center text-gray-600 mb-10">
            Der Vorstand leitet den Verein und ist verantwortlich für die Umsetzung der Vereinsziele.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-700">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-primary-600 font-medium mb-3">{member.rolle}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Detaillierte Informationen zum Vorstand werden in Kürze veröffentlicht.
            Für Kontaktanfragen nutzen Sie bitte unser{' '}
            <Link to="/kontakt" className="text-primary-600 hover:underline">Kontaktformular</Link>.
          </p>
        </div>
      </section>

      {/* Mitmachen CTA */}
      <section className="bg-primary-50 py-12">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Engagieren Sie sich mit uns</h2>
          <p className="text-gray-600 mb-6">
            Werden Sie Teil von Menschlichkeit Österreich und setzen Sie sich gemeinsam mit uns für eine demokratische,
            gerechte Gesellschaft ein.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mitglied-werden"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Mitglied werden
            </Link>
            <Link
              to="/transparenz"
              className="inline-block border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Transparenz & Vereinsdaten
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
