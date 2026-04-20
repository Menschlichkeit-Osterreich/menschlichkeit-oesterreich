import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import JsonLdFaq from '../components/seo/JsonLdFaq';
import { CONTACT_EMAIL, LEGAL_DOCS, LEGAL_FACTS, WHATSAPP_URL } from '../config/siteConfig';
import { Alert } from '../components/ui/Alert';
import { HttpError, http } from '../services/http';

const FAQ = [
  {
    question: 'Wie erreiche ich Menschlichkeit Österreich?',
    answer:
      'Sie erreichen uns per E-Mail unter office@menschlichkeit-oesterreich.at, per WhatsApp unter wa.me/436801608053 oder schriftlich über unsere Zustellanschrift in Pottenbrunn.',
  },
  {
    question: 'Wofür kann ich das Kontaktformular nutzen?',
    answer:
      'Das Formular eignet sich für allgemeine Anfragen, Mitgliedschaft, Spenden, Medienanfragen und Hinweise zu Veranstaltungen oder Bildungsangeboten.',
  },
  {
    question: 'Wo finde ich weitere Informationen zum Verein?',
    answer:
      'Weiterführende Informationen finden Sie auf den Seiten Transparenz, Impressum, Datenschutz, Statuten und Beitragsordnung.',
  },
];

export default function Kontakt() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    consentPrivacy: false,
    newsletterOptIn: false,
  });
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;

    setForm(prev => ({ ...prev, [target.name]: value }));
    setFieldErrors(prev => ({ ...prev, [target.name]: '' }));
    setSubmitError('');
  };

  const focusFirstInvalidField = (errors: Record<string, string>) => {
    if (errors.name) {
      nameRef.current?.focus();
      return;
    }

    if (errors.email) {
      emailRef.current?.focus();
      return;
    }

    if (errors.subject) {
      subjectRef.current?.focus();
      return;
    }

    if (errors.message) {
      messageRef.current?.focus();
      return;
    }

    if (errors.consentPrivacy) {
      consentRef.current?.focus();
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Bitte geben Sie Ihren Namen ein.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (!form.subject.trim()) {
      nextErrors.subject = 'Bitte wählen Sie einen Betreff aus.';
    }

    if (!form.message.trim()) {
      nextErrors.message = 'Bitte geben Sie Ihre Nachricht ein.';
    } else if (form.message.trim().length < 10) {
      nextErrors.message = 'Die Nachricht muss mindestens 10 Zeichen lang sein.';
    }

    if (!form.consentPrivacy) {
      nextErrors.consentPrivacy =
        'Bitte bestätigen Sie die Datenschutzerklärung, bevor Sie die Anfrage absenden.';
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      focusFirstInvalidField(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const [firstName, ...restName] = form.name.trim().split(/\s+/);
    const lastName = restName.join(' ').trim() || firstName;

    try {
      await http.post<{
        success: boolean;
        data?: { submissionId: number; submittedAt: string };
      }>('/api/contact/submit', {
        first_name: firstName,
        last_name: lastName,
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        consent_privacy: form.consentPrivacy,
        newsletter_opt_in: form.newsletterOptIn,
        source: 'website_contact_form',
      });

      setSubmitted(true);
      setFieldErrors({});
    } catch (error) {
      if (error instanceof HttpError && typeof error.body === 'object' && error.body !== null) {
        const detail =
          'detail' in error.body && typeof error.body.detail === 'string'
            ? error.body.detail
            : error.message;
        setSubmitError(detail || 'Ihre Anfrage konnte gerade nicht gesendet werden.');
      } else if (error instanceof Error) {
        setSubmitError(error.message || 'Ihre Anfrage konnte gerade nicht gesendet werden.');
      } else {
        setSubmitError('Ihre Anfrage konnte gerade nicht gesendet werden.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SeoHead
        title="Kontakt – Menschlichkeit Österreich"
        description="Kontaktieren Sie Menschlichkeit Österreich. Wir freuen uns auf Ihre Nachricht. Adresse: Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn."
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
          { name: 'Kontakt', url: 'https://www.menschlichkeit-oesterreich.at/kontakt' },
        ]}
      />
      <JsonLdFaq items={FAQ} />
      {/* Hero */}
      <section
        className="bg-primary-800 py-16 text-white"
      >
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
          <p className="text-xl text-white">
            Fragen zu Mitgliedschaft, Spenden, Veranstaltungen, Bildung oder Medienanfragen
            beantworten wir gerne.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Kontaktinformationen</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
                    📍
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Adresse</p>
                    <address className="not-italic text-sm text-secondary-600">
                      Verein Menschlichkeit Österreich
                      <br />
                      Pottenbrunner Hauptstraße 108/Top 1<br />
                      3140 Pottenbrunn, Österreich
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
                    ✉️
                  </div>
                  <div>
                    <p className="font-semibold mb-1">E-Mail</p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
                    💬
                  </div>
                  <div>
                    <p className="font-semibold mb-1">WhatsApp</p>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-sm"
                    >
                      wa.me/436801608053
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
                    🏛️
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Vereinsregister</p>
                    <p className="text-sm text-secondary-600">
                      ZVR: {LEGAL_FACTS.zvr}
                      <br />
                      Gegründet: {LEGAL_FACTS.foundingDateLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-secondary-200 bg-secondary-50 p-5">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Wichtige Seiten auf einen Blick
                </h3>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link to="/transparenz" className="font-medium text-primary-700 hover:underline">
                    Transparenz
                  </Link>
                  <Link to="/impressum" className="font-medium text-primary-700 hover:underline">
                    Impressum
                  </Link>
                  <Link to="/datenschutz" className="font-medium text-primary-700 hover:underline">
                    Datenschutz
                  </Link>
                  <Link to="/statuten" className="font-medium text-primary-700 hover:underline">
                    Statuten
                  </Link>
                  <Link
                    to="/beitragsordnung"
                    className="font-medium text-primary-700 hover:underline"
                  >
                    Beitragsordnung
                  </Link>
                  <a
                    href={LEGAL_DOCS.registerExcerpt.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-700 hover:underline"
                  >
                    Vereinsregisterauszug
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Nachricht senden</h2>

              {submitted ? (
                <div
                  className="rounded-lg bg-green-50 border border-green-200 p-6 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="text-4xl mb-3" aria-hidden="true">
                    ✅
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">Vielen Dank!</h3>
                  <p className="text-green-700 text-sm">
                    Ihre Anfrage wurde an unser System übermittelt. Sie erhalten eine Bestätigung
                    per E-Mail, sobald wir die Nachricht verarbeitet haben.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  noValidate
                  aria-busy={submitting}
                >
                  {submitError && (
                    <Alert
                      variant="error"
                      title="Anfrage konnte nicht gesendet werden"
                      role="alert"
                    >
                      {submitError}
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium text-secondary-700"
                      >
                        Name{' '}
                        <span aria-hidden="true" className="font-semibold text-error-700">
                          *
                        </span>
                        <span className="sr-only">Pflichtfeld</span>
                      </label>
                      <input
                        ref={nameRef}
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ihr Name"
                        aria-invalid={fieldErrors.name ? 'true' : 'false'}
                        aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                      />
                      {fieldErrors.name && (
                        <p id="name-error" className="mt-1 text-xs text-red-700" role="alert">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-secondary-700"
                      >
                        E-Mail{' '}
                        <span aria-hidden="true" className="font-semibold text-error-700">
                          *
                        </span>
                        <span className="sr-only">Pflichtfeld</span>
                      </label>
                      <input
                        ref={emailRef}
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="ihre@email.at"
                        aria-invalid={fieldErrors.email ? 'true' : 'false'}
                        aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      />
                      {fieldErrors.email && (
                        <p id="email-error" className="mt-1 text-xs text-red-700" role="alert">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1 block text-sm font-medium text-secondary-700"
                    >
                      Betreff{' '}
                      <span aria-hidden="true" className="font-semibold text-error-700">
                        *
                      </span>
                      <span className="sr-only">Pflichtfeld</span>
                    </label>
                    <select
                      ref={subjectRef}
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-invalid={fieldErrors.subject ? 'true' : 'false'}
                      aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="Mitgliedschaft">Mitgliedschaft</option>
                      <option value="Spende">Spende</option>
                      <option value="Ehrenamtliche Mitarbeit">Ehrenamtliche Mitarbeit</option>
                      <option value="Presse & Medien">Presse &amp; Medien</option>
                      <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                    </select>
                    {fieldErrors.subject && (
                      <p id="subject-error" className="mt-1 text-xs text-red-700" role="alert">
                        {fieldErrors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1 block text-sm font-medium text-secondary-700"
                    >
                      Nachricht{' '}
                      <span aria-hidden="true" className="font-semibold text-error-700">
                        *
                      </span>
                      <span className="sr-only">Pflichtfeld</span>
                    </label>
                    <textarea
                      ref={messageRef}
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange}
                      className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ihre Nachricht an uns..."
                      aria-invalid={fieldErrors.message ? 'true' : 'false'}
                      aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                    />
                    {fieldErrors.message && (
                      <p id="message-error" className="mt-1 text-xs text-red-700" role="alert">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 rounded-xl border border-secondary-200 bg-secondary-50 p-4">
                    <label className="flex items-start gap-3 text-sm text-secondary-700">
                      <input
                        ref={consentRef}
                        id="consentPrivacy"
                        name="consentPrivacy"
                        type="checkbox"
                        checked={form.consentPrivacy}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        aria-invalid={fieldErrors.consentPrivacy ? 'true' : 'false'}
                        aria-describedby={fieldErrors.consentPrivacy ? 'consent-error' : undefined}
                      />
                      <span>
                        Ich habe die{' '}
                        <a href="/datenschutz" className="text-primary-600 hover:underline">
                          Datenschutzerklärung
                        </a>{' '}
                        gelesen und stimme der Verarbeitung meiner Anfrage zu. *
                      </span>
                    </label>
                    {fieldErrors.consentPrivacy && (
                      <p id="consent-error" className="text-xs text-red-700" role="alert">
                        {fieldErrors.consentPrivacy}
                      </p>
                    )}

                    <label className="flex items-start gap-3 text-sm text-secondary-700">
                      <input
                        id="newsletterOptIn"
                        name="newsletterOptIn"
                        type="checkbox"
                        checked={form.newsletterOptIn}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>
                        Ich möchte zusätzlich per E-Mail über Vereinsaktivitäten informiert werden
                        (Newsletter, optional). Die Anmeldung erfolgt per Double-Opt-In, und der
                        Widerruf ist jederzeit möglich. Details in der{' '}
                        <a href="/datenschutz" className="text-primary-600 hover:underline">
                          Datenschutzerklärung
                        </a>
                        .
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
                    disabled={submitting}
                    aria-busy={submitting}
                  >
                    {submitting ? 'Nachricht wird gesendet...' : 'Nachricht senden'}
                  </button>

                  <p className="text-xs text-secondary-600">
                    * Pflichtfelder. Ihre Nachricht wird direkt an unser System übermittelt. Ihre
                    Daten werden gemäß unserer{' '}
                    <a href="/datenschutz" className="text-primary-600 hover:underline">
                      Datenschutzerklärung
                    </a>{' '}
                    verarbeitet, und Sie erhalten eine Bestätigung per E-Mail.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-3xl border border-secondary-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-secondary-900">Häufige Anliegen</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {FAQ.map(item => (
                <article
                  key={item.question}
                  className="rounded-2xl border border-secondary-100 bg-secondary-50 p-5"
                >
                  <h3 className="font-semibold text-secondary-900">{item.question}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-secondary-700">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
