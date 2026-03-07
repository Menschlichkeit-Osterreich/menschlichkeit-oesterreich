import React from 'react';
import { Link } from 'react-router-dom';

export default function UeberUns() {
  const values = [
    {
      icon: '🤝',
      title: 'Solidarität',
      description:
        'Zusammenhalt statt Spaltung. Wir stehen füreinander ein, unabhängig von Herkunft, Bildung oder Überzeugung.',
    },
    {
      icon: '⚖️',
      title: 'Soziale Gerechtigkeit',
      description:
        'Chancengleichheit für alle. Jede Person in Österreich soll die gleichen Möglichkeiten haben.',
    },
    {
      icon: '🌱',
      title: 'Ökologische Verantwortung',
      description:
        'Wir handeln nachhaltig und schützen unsere Umwelt für künftige Generationen.',
    },
    {
      icon: '🏛️',
      title: 'Demokratie',
      description:
        'Wir stärken demokratische Werte, Rechtsstaatlichkeit und gesellschaftliche Teilhabe.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Über uns</h1>
          <p className="text-xl text-white/80">
            Wer wir sind, wofür wir stehen und warum wir uns engagieren.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Unsere Mission</h2>
          <div className="prose prose-lg text-gray-700 mx-auto">
            <p>
              Der Verein Menschlichkeit Österreich wurde am <strong>28. Mai 2025</strong> mit
              einer klaren Vision gegründet: Ein Österreich zu gestalten, das niemanden
              zurücklässt.
            </p>
            <p>
              In Zeiten gesellschaftlicher Spaltung und wachsender Ungleichheit setzen wir
              ein klares Zeichen für Solidarität, Menschlichkeit und gemeinsames Handeln.
              Wir glauben, dass eine gerechte, ökologisch verantwortungsvolle und demokratische
              Gesellschaft möglich ist – wenn wir gemeinsam dafür eintreten.
            </p>
            <p>
              Als gemeinnützig anerkannter Verein (ZVR: 1182213083) arbeiten wir
              ehrenamtlich und unparteiisch für das Wohl aller Menschen in Österreich.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3 text-center">Unsere Werte</h2>
          <p className="text-gray-500 text-center mb-10">
            Die Grundprinzipien unseres Handelns
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Vorstand */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Der Vorstand</h2>
          <p className="text-gray-500 mb-8">
            Der Verein wird von einem ehrenamtlichen Vorstand geführt. Für Informationen
            über die aktuellen Vorstandsmitglieder wenden Sie sich bitte direkt an uns.
          </p>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <span aria-hidden="true">✉️</span>
            Kontakt aufnehmen
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-primary-700 text-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Werde Teil der Bewegung</h2>
          <p className="text-white/80 mb-8">
            Als Mitglied gestaltest du aktiv mit und stärkst die Gemeinschaft.
            Alle sind herzlich willkommen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mitglied-werden"
              className="px-8 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Mitglied werden
            </Link>
            <Link
              to="/spenden"
              className="px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Spenden
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
