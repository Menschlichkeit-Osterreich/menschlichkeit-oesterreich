import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/seo/SeoHead';
import JsonLdBreadcrumb from '../components/seo/JsonLdBreadcrumb';
import JsonLdFaq from '../components/seo/JsonLdFaq';
import { CONTACT_EMAIL, LEGAL_DOCS, LEGAL_FACTS, WHATSAPP_URL } from '../config/siteConfig';

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
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open mail client as fallback (no server-side form yet)
    const body = encodeURIComponent(
      `Name: ${form.name}\nE-Mail: ${form.email}\n\nNachricht:\n${form.message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(form.subject || 'Anfrage über Website')}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div>
      <SeoHead
        title="Kontakt – Menschlichkeit Österreich"
        description="Kontaktieren Sie Menschlichkeit Österreich. Wir freuen uns auf Ihre Nachricht. Adresse: Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn."
      />
      <JsonLdBreadcrumb items={[
        { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
        { name: 'Kontakt', url: 'https://www.menschlichkeit-oesterreich.at/kontakt' },
      ]} />
      <JsonLdFaq items={FAQ} />
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
          <p className="text-xl text-white/80">
            Fragen zu Mitgliedschaft, Spenden, Veranstaltungen, Bildung oder Medienanfragen beantworten wir gerne.
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
                    <address className="not-italic text-gray-600 text-sm">
                      Verein Menschlichkeit Österreich<br />
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
                    <p className="text-gray-600 text-sm">
                      ZVR: {LEGAL_FACTS.zvr}<br />
                      Gegründet: {LEGAL_FACTS.foundingDateLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-secondary-200 bg-secondary-50 p-5">
                <h3 className="text-lg font-semibold text-secondary-900">Wichtige Seiten auf einen Blick</h3>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link to="/transparenz" className="font-medium text-primary-700 hover:underline">Transparenz</Link>
                  <Link to="/impressum" className="font-medium text-primary-700 hover:underline">Impressum</Link>
                  <Link to="/datenschutz" className="font-medium text-primary-700 hover:underline">Datenschutz</Link>
                  <Link to="/statuten" className="font-medium text-primary-700 hover:underline">Statuten</Link>
                  <Link to="/beitragsordnung" className="font-medium text-primary-700 hover:underline">Beitragsordnung</Link>
                  <a href={LEGAL_DOCS.registerExcerpt.href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 hover:underline">Vereinsregisterauszug</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Nachricht senden</h2>

              {submitted ? (
                <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
                  <div className="text-4xl mb-3" aria-hidden="true">✅</div>
                  <h3 className="font-semibold text-green-800 mb-2">Vielen Dank!</h3>
                  <p className="text-green-700 text-sm">
                    Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die vorbereitete
                    E-Mail ab, um uns zu kontaktieren.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span aria-hidden="true" className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ihr Name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-Mail <span aria-hidden="true" className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="ihre@email.at"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Betreff
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="Mitgliedschaft">Mitgliedschaft</option>
                      <option value="Spende">Spende</option>
                      <option value="Ehrenamtliche Mitarbeit">Ehrenamtliche Mitarbeit</option>
                      <option value="Presse & Medien">Presse &amp; Medien</option>
                      <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Nachricht <span aria-hidden="true" className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Ihre Nachricht an uns..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Nachricht senden
                  </button>

                  <p className="text-xs text-gray-500">
                    * Pflichtfelder. Mit dem Absenden öffnet sich Ihr E-Mail-Programm.
                    Ihre Daten werden gemäß unserer{' '}
                    <a href="/datenschutz" className="text-primary-600 hover:underline">
                      Datenschutzerklärung
                    </a>{' '}
                    verarbeitet.
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
              {FAQ.map((item) => (
                <article key={item.question} className="rounded-2xl border border-secondary-100 bg-secondary-50 p-5">
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
