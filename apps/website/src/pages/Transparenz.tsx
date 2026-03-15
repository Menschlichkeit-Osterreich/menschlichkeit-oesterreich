import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';

export default function TransparenzPage() {
  return (
    <div>
      <SeoHead
        title="Transparenz – Vereinsdaten &amp; Finanzen"
        description="Transparenz bei Menschlichkeit Österreich: ZVR-Nummer, Vereinszweck, Mittelverwendung und Finanzprinzipien. Gemeinnützigkeit und Rechenschaftspflicht."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-800 to-secondary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Transparenz</h1>
          <p className="text-xl text-white/80">
            Offenheit und Rechenschaft als Grundlage unseres Handelns.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-14 space-y-12">

        {/* Vereinsdaten */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Vereinsdaten</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Vereinsname', 'Menschlichkeit Österreich'],
                  ['ZVR-Zahl', '1182213083'],
                  ['Rechtsform', 'Gemeinnütziger Verein (ZVR-Österreich)'],
                  ['Gründungsdatum', '28. Mai 2025'],
                  ['Vereinssitz', 'Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn'],
                  ['Zuständige Behörde', 'Bezirkshauptmannschaft St. Pölten-Land'],
                  ['E-Mail', 'kontakt@menschlichkeit-oesterreich.at'],
                  ['Website', 'www.menschlichkeit-oesterreich.at'],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-700 w-1/3">{label}</td>
                    <td className="px-5 py-3 text-gray-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Vereinszweck */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Vereinszweck</h2>
          <div className="prose prose-lg text-gray-700">
            <p>
              Menschlichkeit Österreich ist ein gemeinnütziger Verein zur Förderung von Demokratie,
              Menschenrechten, sozialer Gerechtigkeit und zivilgesellschaftlichem Engagement in
              Österreich.
            </p>
            <p>
              Der Verein verfolgt ausschließlich gemeinnützige Zwecke im Sinne der
              österreichischen Bundesabgabenordnung (BAO). Eine Gewinnorientierung ist
              ausgeschlossen. Alle Mittel werden zweckgebunden für die Vereinsarbeit verwendet.
            </p>
          </div>
        </section>

        {/* Mittelverwendung */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Mittelverwendung</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Bildungsarbeit & Materialien', desc: 'Entwicklung und Bereitstellung von Bildungsressourcen zu Demokratie und Menschenrechten.' },
              { label: 'Veranstaltungen', desc: 'Organisation von Workshops, Diskussionen und Community-Events.' },
              { label: 'Öffentlichkeitsarbeit', desc: 'Information der Öffentlichkeit über die Vereinsziele und -aktivitäten.' },
              { label: 'Verwaltung', desc: 'Notwendige administrative Kosten für den Vereinsbetrieb (maximal).' },
            ].map(({ label, desc }) => (
              <div key={label} className="bg-primary-50 rounded-lg p-5">
                <h3 className="font-semibold text-primary-800 mb-2">{label}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Finanzprinzipien */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Unsere Finanzprinzipien</h2>
          <ul className="space-y-3 text-gray-700">
            {[
              'Alle Einnahmen (Mitgliedsbeiträge, Spenden) werden ausschließlich für den Vereinszweck verwendet.',
              'Kein Vereinsmitglied erhält Zuwendungen aus Vereinsmitteln.',
              'Bei Auflösung des Vereins fließt das Vereinsvermögen einer gemeinnützigen Organisation zu.',
              'Der Jahresabschluss wird dem Vorstand und den Mitgliedern in der Jahreshauptversammlung präsentiert.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-primary-600 mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Links */}
        <section className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Weitere Informationen</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/statuten" className="text-primary-600 hover:underline font-medium">→ Vereinsstatuten</Link>
            <Link to="/beitragsordnung" className="text-primary-600 hover:underline font-medium">→ Beitragsordnung</Link>
            <Link to="/team" className="text-primary-600 hover:underline font-medium">→ Unser Team</Link>
            <Link to="/kontakt" className="text-primary-600 hover:underline font-medium">→ Kontakt</Link>
            <Link to="/impressum" className="text-primary-600 hover:underline font-medium">→ Impressum</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
