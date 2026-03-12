import React from 'react';

export default function Impressum() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Impressum</h1>
      <p className="text-gray-500 mb-8">Angaben gemäß § 25 MedienG und § 14 UGB</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Herausgeber &amp; Medieninhaber</h2>
          <address className="not-italic text-gray-700 leading-relaxed">
            <strong>Verein Menschlichkeit Österreich</strong><br />
            Pottenbrunner Hauptstraße 108/Top 1<br />
            3140 Pottenbrunn<br />
            Österreich
          </address>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
          <p className="text-gray-700">
            E-Mail:{' '}
            <a
              href="mailto:kontakt@menschlichkeit-oesterreich.at"
              className="text-primary-600 hover:underline"
            >
              kontakt@menschlichkeit-oesterreich.at
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Vereinsregister</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <dt className="font-medium">ZVR-Zahl</dt>
            <dd>1182213083</dd>
            <dt className="font-medium">Vereinsbehörde</dt>
            <dd>Landespolizeidirektion Niederösterreich (LPD NÖ)</dd>
            <dt className="font-medium">Gründungsdatum</dt>
            <dd>28. Mai 2025</dd>
            <dt className="font-medium">Gemeinnützigkeit</dt>
            <dd>Anerkannt nach §§ 34 ff. BAO</dd>
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Vereinszweck</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Verein Menschlichkeit Österreich verfolgt ausschließlich gemeinnützige Zwecke.
            Ziel ist die Förderung von Solidarität, sozialer Gerechtigkeit, ökologischer
            Verantwortung und demokratischen Werten in Österreich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>
          <p className="text-gray-700 leading-relaxed">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
            jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
          <p className="text-gray-700 leading-relaxed">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
            unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung,
            Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
            bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
    </div>
  );
}
