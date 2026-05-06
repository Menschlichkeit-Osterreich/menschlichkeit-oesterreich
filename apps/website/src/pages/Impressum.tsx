import { Link } from 'react-router-dom';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SeoHead from '../components/seo/SeoHead';
import {
  CONTACT_EMAIL,
  LEGAL_DOCS,
  LEGAL_FACTS,
  SITE_URL,
  WHATSAPP_URL,
} from '../config/siteConfig';

export default function Impressum() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <SeoHead
        title="Impressum – Menschlichkeit Österreich"
        description="Impressum des Vereins Menschlichkeit Österreich gemäß § 25 MedienG. ZVR: 1182213083."
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Impressum', url: 'https://www.menschlichkeit-oesterreich.at/impressum' },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">Impressum</h1>
      <p className="text-gray-500 mb-8">Angaben gemäß § 25 MedienG und § 14 UGB</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Herausgeber &amp; Medieninhaber</h2>
          <address className="not-italic text-gray-700 leading-relaxed">
            <strong>Verein Menschlichkeit Österreich</strong>
            <br />
            Pottenbrunner Hauptstraße 108/Top 1<br />
            3140 Pottenbrunn
            <br />
            Österreich
          </address>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
          <p className="text-gray-700">
            Website:{' '}
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              {SITE_URL}
            </a>
          </p>
          <p className="text-gray-700">
            E-Mail:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-gray-700">
            WhatsApp:{' '}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              wa.me/436801608053
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Vereinsregister</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <dt className="font-medium">ZVR-Zahl</dt>
            <dd>{LEGAL_FACTS.zvr}</dd>
            <dt className="font-medium">Gründungsdatum</dt>
            <dd>{LEGAL_FACTS.foundingDateLabel}</dd>
            <dt className="font-medium">Vereinssitz</dt>
            <dd>{LEGAL_FACTS.seat}</dd>
            <dt className="font-medium">Vereinsbehörde</dt>
            <dd>{LEGAL_FACTS.registerAuthority}</dd>
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Vertretungsbefugtes Organ</h2>
          <p className="text-gray-700 leading-relaxed">
            Vertretungsbefugt ist der Vorstand gemäß den jeweils gültigen Statuten des Vereins.
            Maßgeblich ist die aktuelle, im Verein beschlossene Statutenfassung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Grundlegende Richtung (§ 25 MedienG)</h2>
          <p className="text-gray-700 leading-relaxed">
            Diese Website dient der Information über Ziele, Werte, Aktivitäten und
            Beteiligungsmöglichkeiten von Menschlichkeit Österreich sowie der Förderung von
            Demokratie, Menschenrechten, sozialer Gerechtigkeit und zivilgesellschaftlicher Teilhabe
            in Österreich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Vereinszweck</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Verein Menschlichkeit Österreich setzt sich laut Statuten für Solidarität, soziale
            Gerechtigkeit, ökologische Verantwortung und demokratische Werte in Österreich ein. Für
            die verbindliche juristische Fassung verweisen wir auf die bereitgestellten Statuten.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>
          <p className="text-gray-700 leading-relaxed">
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die
            Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr
            übernehmen. Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
          <p className="text-gray-700 leading-relaxed">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und
            jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold mb-3">Weiterführende Informationen</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Weitere Angaben zu Datenschutz, Transparenz und Vereinsgrundlagen finden Sie auf den
            folgenden Seiten.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/datenschutz" className="font-medium text-primary-600 hover:underline">
              Datenschutz
            </Link>
            <Link to="/transparenz" className="font-medium text-primary-600 hover:underline">
              Transparenz
            </Link>
            <Link to="/statuten" className="font-medium text-primary-600 hover:underline">
              Statuten
            </Link>
            <Link to="/kontakt" className="font-medium text-primary-600 hover:underline">
              Kontakt
            </Link>
            <a
              href={LEGAL_DOCS.statutes.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 hover:underline"
            >
              Statuten als PDF
            </a>
            <a
              href={LEGAL_DOCS.registerExcerpt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 hover:underline"
            >
              Vereinsregisterauszug
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
