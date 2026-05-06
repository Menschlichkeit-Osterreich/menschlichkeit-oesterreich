import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { LEGAL_DOCS } from '../config/siteConfig';

const TYPE_LABELS: Record<string, string> = {
  ordentlich: 'Ordentliches Mitglied',
  ausserordentlich: 'Außerordentliches Mitglied',
  foerdernd: 'Fördermitglied',
};

const CATEGORY_LABELS: Record<string, string> = {
  standard: 'Standard',
  ermaessigt: 'Ermäßigt',
  haertefall: 'Härtefall / individuelle Vereinbarung',
};

const PAYMENT_LABELS: Record<string, string> = {
  sepa: 'Überweisung / Dauerauftrag',
  stripe_card: 'Digitale Zahlung',
};

export default function MembershipSuccessPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') ?? '';
  const category = searchParams.get('category') ?? '';
  const payment = searchParams.get('payment') ?? '';

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-6">
      <SeoHead
        title="Mitgliedsantrag erfolgreich übermittelt – Menschlichkeit Österreich"
        description="Ihr Mitgliedsantrag wurde erfolgreich übermittelt. Alle nächsten Schritte zur Mitgliedschaft bei Menschlichkeit Österreich finden Sie hier."
        noIndex={true}
      />
      <Breadcrumb items={[{ label: 'Mitglied werden', href: '/mitglied-werden' }, { label: 'Danke' }]} />

      <section className="rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-orange-50 p-8 shadow-sm">
        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700">
          Antrag erhalten
        </span>
        <h1 className="mt-4 text-3xl font-bold text-secondary-900">Vielen Dank für Ihren Mitgliedsantrag</h1>
        <p className="mt-3 max-w-2xl text-secondary-700 leading-relaxed">
          Ihr Antrag wurde gespeichert. Damit stärken Sie unsere Arbeit für Demokratie, Menschenrechte und soziale
          Gerechtigkeit in Österreich.
        </p>
      </section>

      <section className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-secondary-900">Ihre Angaben im Überblick</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-secondary-50 p-4">
            <dt className="text-secondary-500">Mitgliedsart</dt>
            <dd className="mt-1 font-semibold text-secondary-900">{TYPE_LABELS[type] ?? 'Mitgliedschaft'}</dd>
          </div>
          <div className="rounded-xl bg-secondary-50 p-4">
            <dt className="text-secondary-500">Beitragskategorie</dt>
            <dd className="mt-1 font-semibold text-secondary-900">{CATEGORY_LABELS[category] ?? 'Nicht angegeben'}</dd>
          </div>
          <div className="rounded-xl bg-secondary-50 p-4 sm:col-span-2">
            <dt className="text-secondary-500">Zahlungsweg</dt>
            <dd className="mt-1 font-semibold text-secondary-900">{PAYMENT_LABELS[payment] ?? 'Wird individuell abgestimmt'}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Wie es weitergeht</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-secondary-700">
            <li>Wir prüfen Ihren Antrag im Rahmen der Vereinsabläufe.</li>
            <li>Bei SEPA oder individueller Beitragsvereinbarung melden wir uns bei Rückfragen per E-Mail.</li>
            <li>Wichtige rechtliche Informationen finden Sie in den Statuten, der Beitragsordnung und der Datenschutzerklärung.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900">Nützliche Direktlinks</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link to="/statuten" className="font-medium text-primary-700 hover:underline">Statuten lesen</Link>
            <Link to="/beitragsordnung" className="font-medium text-primary-700 hover:underline">Beitragsordnung ansehen</Link>
            <a href={LEGAL_DOCS.statutes.href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 hover:underline">Statuten als PDF</a>
            <a href={LEGAL_DOCS.contributionRules.href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 hover:underline">Beitragsordnung als PDF</a>
            <Link to="/transparenz" className="font-medium text-primary-700 hover:underline">Transparenz & Vereinsdaten</Link>
            <Link to="/kontakt" className="font-medium text-primary-700 hover:underline">Kontakt aufnehmen</Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-secondary-900">Schon jetzt weiter vernetzen</h2>
        <p className="mt-3 text-secondary-700 leading-relaxed">
          Während Ihr Antrag bearbeitet wird, können Sie sich bereits über unsere Themen, Bildungsangebote und
          Veranstaltungen informieren.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/themen"
            className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-800 transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            Unsere Themen
          </Link>
          <Link
            to="/veranstaltungen"
            className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-800 transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            Veranstaltungen
          </Link>
          <Link
            to="/bildung"
            className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-800 transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            Bildung
          </Link>
        </div>
      </section>
    </div>
  );
}
