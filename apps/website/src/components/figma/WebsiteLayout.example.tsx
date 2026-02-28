import React from 'react';
import {
  HeaderNavigation,
  HeroSection,
  FeaturesGrid,
  CtaSection,
  Footer
} from './components/figma';

/**
 * Website Layout Example
 * Demonstrates how to use the Figma-generated components
 * 
 * Source: https://www.figma.com/make/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=0-1
 */
export function WebsiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <HeaderNavigation className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">
            Menschlichkeit Österreich
          </div>
          <ul className="hidden md:flex space-x-6">
            <li><a href="#" className="text-gray-700 hover:text-primary-600">Über uns</a></li>
            <li><a href="#" className="text-gray-700 hover:text-primary-600">Projekte</a></li>
            <li><a href="#" className="text-gray-700 hover:text-primary-600">Mitmachen</a></li>
            <li><a href="#" className="text-gray-700 hover:text-primary-600">Kontakt</a></li>
          </ul>
          <button className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600">
            Spenden
          </button>
        </nav>
      </HeaderNavigation>

      {/* Hero Section */}
      <HeroSection className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Menschlichkeit ist keine Option, sondern Pflicht
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Wir handeln dort, wo andere wegschauen. Gemeinsam schaffen wir ein Österreich, 
            das niemanden zurücklässt.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100">
              Jetzt unterstützen
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white/10">
              Mehr erfahren
            </button>
          </div>
        </div>
      </HeroSection>

      {/* Features Grid */}
      <FeaturesGrid className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Schwerpunkte</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Bildungsarbeit</h3>
              <p className="text-gray-600">
                Politische Bildung und Empowerment für aktive gesellschaftliche Teilhabe
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Klimaschutz</h3>
              <p className="text-gray-600">
                Nachhaltige Initiativen für einen zukunftsfähigen, klimabewussten Lebensstil
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Soziale Projekte</h3>
              <p className="text-gray-600">
                Direkte Unterstützung für Menschen in Notlagen und soziale Gerechtigkeit
              </p>
            </div>
          </div>
        </div>
      </FeaturesGrid>

      {/* CTA Section */}
      <CtaSection className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Werden Sie Teil der Bewegung</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Gemeinsam können wir etwas bewegen. Ihre Unterstützung macht den Unterschied.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100">
              Mitglied werden
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white/10">
              Newsletter abonnieren
            </button>
          </div>
        </div>
      </CtaSection>

      {/* Footer */}
      <Footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Menschlichkeit Österreich</h3>
              <p className="text-sm">
                ZVR-Zahl: 1182213083<br />
                3140 Pottenbrunn<br />
                Pottenbrunner Hauptstraße 108/Top 1
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Über uns</a></li>
                <li><a href="#" className="hover:text-white">Projekte</a></li>
                <li><a href="#" className="hover:text-white">Spenden</a></li>
                <li><a href="#" className="hover:text-white">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Datenschutz</a></li>
                <li><a href="#" className="hover:text-white">Impressum</a></li>
                <li><a href="#" className="hover:text-white">Statuten</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Folgen Sie uns</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2025 Menschlichkeit Österreich. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </Footer>
    </div>
  );
}

export default WebsiteLayout;
