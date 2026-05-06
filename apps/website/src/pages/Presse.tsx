import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import { CONTACT_EMAIL, LEGAL_FACTS } from '../config/siteConfig';

const FAKTEN = [
  { label: 'Gründungsjahr', value: '2025' },
  { label: 'Rechtsform', value: 'Verein laut Vereinsregister' },
  { label: 'ZVR-Zahl', value: LEGAL_FACTS.zvr },
  { label: 'Vereinssitz', value: LEGAL_FACTS.seat },
  { label: 'Tätigkeitsschwerpunkte', value: 'Demokratiebildung, Menschenrechte, soziale Gerechtigkeit' },
  { label: 'Zielgruppe', value: 'Alle Menschen in Österreich' },
];

export default function PressePage() {
  return (
    <div>
      <SeoHead
        title="Presse – Menschlichkeit Österreich"
        description="Presseinformationen, Kontakt für Medienanfragen und Basisdaten über den Verein Menschlichkeit Österreich. Logos und Bildmaterial auf Anfrage."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-700 to-secondary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Presse & Medien</h1>
          <p className="text-xl text-white/80">
            Informationen für Journalistinnen und Journalisten sowie Medienvertreterinnen.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14 space-y-12">

        {/* Pressekontakt */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Pressekontakt</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-700 mb-4">
              Für Medienanfragen, Interviewwünsche und weitere Presseinformationen wenden Sie sich bitte an:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Menschlichkeit Österreich</strong></p>
              <p>Pottenbrunner Hauptstraße 108/Top 1</p>
              <p>3140 Pottenbrunn, Österreich</p>
              <p>
                E-Mail:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Über den Verein */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Über den Verein</h2>
          <div className="prose prose-lg text-gray-700">
            <p>
              Menschlichkeit Österreich ist ein 2025 gegründeter Verein mit dem Ziel,
              demokratische Werte, Menschenrechte und soziale Gerechtigkeit in Österreich zu stärken.
              Der Verein bietet Bildungsangebote für alle Altersgruppen und schafft Räume für
              gesellschaftliche Teilhabe und zivilgesellschaftliches Engagement.
            </p>
            <p>
              Zu den Tätigkeitsschwerpunkten zählen die Entwicklung von Bildungsmaterialien,
              die Organisation von Workshops und Diskussionsveranstaltungen sowie der Betrieb einer
              Online-Community-Plattform.
            </p>
          </div>
        </section>

        {/* Basisdaten */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basisdaten auf einen Blick</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {FAKTEN.map(({ label, value }) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-700 w-2/5">{label}</td>
                    <td className="px-5 py-3 text-gray-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bildmaterial */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Bildmaterial & Logos</h2>
          <p className="text-gray-700 mb-4">
            Logos, Grafiken und weiteres Bildmaterial für die Medienberichterstattung stellen wir auf
            Anfrage gerne zur Verfügung. Bitte kontaktieren Sie uns per E-Mail.
          </p>
          <Link
            to="/kontakt"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Presseanfrage stellen
          </Link>
        </section>

      </div>
    </div>
  );
}
