import React, { useState } from 'react';
import SeoHead from '../components/seo/SeoHead';

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
    window.location.href = `mailto:kontakt@menschlichkeit-oesterreich.at?subject=${encodeURIComponent(form.subject || 'Anfrage über Website')}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div>
      <SeoHead
        title="Kontakt – Menschlichkeit Österreich"
        description="Kontaktieren Sie Menschlichkeit Österreich. Wir freuen uns auf Ihre Nachricht. Adresse: Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn."
      />
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
          <p className="text-xl text-white/80">Wir freuen uns auf Ihre Nachricht.</p>
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
                      href="mailto:kontakt@menschlichkeit-oesterreich.at"
                      className="text-primary-600 hover:underline text-sm"
                    >
                      kontakt@menschlichkeit-oesterreich.at
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
                      ZVR: 1182213083<br />
                      Gemeinnützig nach BAO anerkannt<br />
                      Gegründet: 28. Mai 2025
                    </p>
                  </div>
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
    </div>
  );
}
