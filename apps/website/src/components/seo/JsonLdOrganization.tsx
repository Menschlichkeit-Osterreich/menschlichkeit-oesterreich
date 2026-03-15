import React from 'react';
import JsonLdScript from './JsonLdScript';

/**
 * Shared NGO/Organization JSON-LD schema.
 * Include on every public-facing page for consistent brand signals.
 */
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  '@id': 'https://www.menschlichkeit-oesterreich.at/#organization',
  name: 'Menschlichkeit Österreich',
  alternateName: 'Verein zur Förderung von Demokratie, Menschenrechten und Zivilgesellschaft',
  url: 'https://www.menschlichkeit-oesterreich.at',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.menschlichkeit-oesterreich.at/logo.jpg',
    width: 400,
    height: 400,
  },
  foundingDate: '2025-05-28',
  description:
    'Gemeinnütziger Verein zur Förderung von Demokratie, Menschenrechten, sozialer Gerechtigkeit und Zivilgesellschaft in Österreich.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Pottenbrunner Hauptstraße 108/Top 1',
    addressLocality: 'Pottenbrunn',
    postalCode: '3140',
    addressCountry: 'AT',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'kontakt@menschlichkeit-oesterreich.at',
    contactType: 'customer service',
    areaServed: 'AT',
    availableLanguage: ['de'],
  },
  sameAs: [
    'https://www.facebook.com/menschlichkeit.oesterreich',
    'https://www.instagram.com/menschlichkeit.oesterreich',
    'https://www.linkedin.com/company/menschlichkeit-oesterreich',
    'https://x.com/menschlichkeitAT',
  ],
  potentialAction: [
    {
      '@type': 'DonateAction',
      name: 'Spenden',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.menschlichkeit-oesterreich.at/spenden',
      },
    },
    {
      '@type': 'JoinAction',
      name: 'Mitglied werden',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.menschlichkeit-oesterreich.at/mitglied-werden',
      },
    },
  ],
};

export default function JsonLdOrganization() {
  return <JsonLdScript schema={ORGANIZATION_SCHEMA} />;
}
