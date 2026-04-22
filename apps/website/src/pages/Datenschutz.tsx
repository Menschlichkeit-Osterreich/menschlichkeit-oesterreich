import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import SeoHead from '../components/seo/SeoHead';
import { CONTACT_EMAIL } from '../config/siteConfig';

export default function Datenschutz() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <SeoHead
        title="Datenschutzerklärung – Menschlichkeit Österreich"
        description="Datenschutzerklärung gemäß DSGVO und österreichischem Datenschutzgesetz. Ihre Rechte als betroffene Person, Datenspeicherung und Kontakt zum Datenschutzbeauftragten."
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Datenschutz', url: 'https://www.menschlichkeit-oesterreich.at/datenschutz' },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">Datenschutzerklärung</h1>
      <p className="text-gray-500 mb-8">
        Gemäß DSGVO (EU) 2016/679 und dem österreichischen Datenschutzgesetz (DSG)
      </p>

      <nav
        aria-label="Inhaltsverzeichnis Datenschutz"
        className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Schnellnavigation
        </h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            href="#verantwortliche-stelle"
            className="font-medium text-primary-700 hover:underline"
          >
            Verantwortliche Stelle
          </a>
          <a href="#verarbeitung" className="font-medium text-primary-700 hover:underline">
            Verarbeitung
          </a>
          <a href="#rechte" className="font-medium text-primary-700 hover:underline">
            Betroffenenrechte
          </a>
          <a href="#cookies" className="font-medium text-primary-700 hover:underline">
            Cookies
          </a>
          <a href="#kontakt-datenschutz" className="font-medium text-primary-700 hover:underline">
            Kontakt
          </a>
        </div>
      </nav>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section id="verantwortliche-stelle">
          <h2 className="text-xl font-semibold mb-3">1. Verantwortliche Stelle</h2>
          <address className="not-italic">
            <strong>Verein Menschlichkeit Österreich</strong>
            <br />
            Pottenbrunner Hauptstraße 108/Top 1<br />
            3140 Pottenbrunn
            <br />
            E-Mail:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </address>
        </section>

        <section id="verarbeitung">
          <h2 className="text-xl font-semibold mb-3">
            2. Erhebung und Verarbeitung personenbezogener Daten
          </h2>
          <p>
            Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies für die Erfüllung
            unserer Vereinstätigkeit erforderlich ist. Dies umfasst:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>
              Mitgliedschaftsdaten (Name, Adresse, E-Mail) für die Verwaltung der Mitgliedschaft
            </li>
            <li>
              Kontaktdaten bei Anfragen über das Kontaktformular (inkl. verpflichtender
              Datenschutz-Einwilligung)
            </li>
            <li>
              Newsletter-Daten (E-Mail, optional Vor- und Nachname) für den Versand nach
              Double-Opt-In-Bestätigung
            </li>
            <li>
              Zahlungsdaten für Mitgliedsbeiträge und Spenden (inkl. Stripe-gestützter
              Zahlungsabwicklung sowie alternativer Zahlungsarten wie SEPA/Überweisung)
            </li>
            <li>
              Technische Daten für Sicherheit und Betrieb (z. B. IP-/User-Agent-Hash in
              Formularprozessen)
            </li>
          </ul>
          <p className="mt-3">
            Auf der Website sind Einwilligungen in den relevanten Formularen integriert: Kontakt,
            Mitgliedschaft, Spende und Newsletter-Anmeldung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Rechtsgrundlagen</h2>
          <p>Die Verarbeitung erfolgt auf Basis folgender Rechtsgrundlagen:</p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) – bei der Anmeldung zum Newsletter</li>
            <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) – bei der Mitgliedschaft</li>
            <li>
              Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung) – bei steuerrelevanten Daten
            </li>
            <li>
              Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen) – für die Website-Sicherheit
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Datenweitergabe</h2>
          <p>Wir geben Ihre Daten nicht an Dritte weiter, außer:</p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>Wenn Sie ausdrücklich eingewilligt haben</li>
            <li>
              An Zahlungsdienstleister zur Abwicklung von Beiträgen/Spenden (insbesondere Stripe,
              sofern diese Zahlungsart gewählt wird)
            </li>
            <li>
              An unsere vereinsinterne CRM-/Verwaltungskette (CiviCRM) zur Mitglieder-, Kontakt- und
              Newsletterverwaltung
            </li>
            <li>
              An technische Auftragsverarbeiter für den sicheren Betrieb und die Verarbeitung von
              Ereignissen (z. B. automatisierte Workflow-Verarbeitung)
            </li>
            <li>Wenn wir gesetzlich dazu verpflichtet sind</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Newsletter und Einwilligungsmanagement</h2>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>
              Newsletter-Anmeldungen erfolgen per Double-Opt-In. Erst nach Bestätigung über den
              Bestätigungslink wird die Anmeldung aktiviert.
            </li>
            <li>
              Der Bestätigungslink ist zeitlich begrenzt, und eine erneute Anmeldung ist danach
              erforderlich.
            </li>
            <li>
              Jede Marketing-Einwilligung ist widerrufbar; Abmeldelinks sind in den
              Newsletter-E-Mails enthalten.
            </li>
            <li>
              Optionale Newsletter-Opt-ins in Kontakt- und Mitgliedschaftsprozessen führen in
              denselben Double-Opt-In-Prozess.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Speicherdauer</h2>
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck
            erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Mitgliedsdaten werden
            nach Beendigung der Mitgliedschaft gelöscht, sofern keine steuerlichen oder rechtlichen
            Gründe einer Löschung entgegenstehen.
          </p>
        </section>

        <section id="rechte">
          <h2 className="text-xl font-semibold mb-3">7. Ihre Rechte</h2>
          <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>
              <strong>Auskunftsrecht</strong> (Art. 15 DSGVO)
            </li>
            <li>
              <strong>Berichtigungsrecht</strong> (Art. 16 DSGVO)
            </li>
            <li>
              <strong>Löschungsrecht</strong> (Art. 17 DSGVO)
            </li>
            <li>
              <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)
            </li>
            <li>
              <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)
            </li>
            <li>
              <strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)
            </li>
            <li>
              <strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)
            </li>
          </ul>
          <p className="mt-3" id="kontakt-datenschutz">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-3 rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-secondary-700">
            Für Auskunfts-, Berichtigungs-, Löschungs- oder Widerspruchsanfragen können Sie uns
            direkt per E-Mail kontaktieren. Bitte beschreiben Sie Ihr Anliegen möglichst konkret,
            damit wir Ihre Anfrage schneller zuordnen können.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Beschwerderecht</h2>
          <p>
            Sie haben das Recht, Beschwerde bei der österreichischen Datenschutzbehörde einzulegen:
          </p>
          <address className="not-italic mt-3">
            <strong>Datenschutzbehörde</strong>
            <br />
            Barichgasse 40–42
            <br />
            1030 Wien
            <br />
            <a
              href="https://www.dsb.gv.at"
              className="text-primary-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.dsb.gv.at
            </a>
          </address>
        </section>

        <section id="cookies">
          <h2 className="text-xl font-semibold mb-3">9. Cookies und Einwilligungssteuerung</h2>
          <p>
            Diese Website verwendet ein Consent-Banner mit Kategorien für notwendige, Analyse-,
            Marketing-, Personalisierungs- und Social-Media-Einstellungen. Notwendige Cookies
            bleiben aktiv, optionale Kategorien sind standardmäßig deaktiviert und werden nur nach
            Ihrer Auswahl gesetzt bzw. aktiviert.
          </p>
          <p className="mt-3">
            Ihre Auswahl wird lokal in den Consent-Einstellungen gespeichert und kann über die
            Datenschutz-/Cookie-Einstellungen jederzeit angepasst werden. Wenn Sie Fragen zu
            Einwilligungen, Cookies oder gespeicherten Daten haben, schreiben Sie uns bitte an{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">Stand: April 2026</p>
      </div>
    </div>
  );
}
