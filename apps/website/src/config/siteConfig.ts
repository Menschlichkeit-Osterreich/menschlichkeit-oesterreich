export const SITE_NAME = 'Menschlichkeit Österreich';
export const SITE_URL = 'https://www.menschlichkeit-oesterreich.at';
export const CRM_SITE_URL = 'https://crm.menschlichkeit-oesterreich.at';
export const GAMES_SITE_URL = 'https://games.menschlichkeit-oesterreich.at';
export const SITE_LANGUAGE = 'de-AT';
export const SITE_LOCALE = 'de_AT';
export const SITE_DESCRIPTION =
  'Menschlichkeit Österreich stärkt Demokratie, Menschenrechte, soziale Gerechtigkeit und zivilgesellschaftliche Teilhabe in Österreich.';
export const CONTACT_EMAIL = 'office@menschlichkeit-oesterreich.at';
export const WHATSAPP_URL = 'https://wa.me/436801608053';

export const LOGO_PATH = '/logo.jpg';
export const LOGO_URL = `${SITE_URL}${LOGO_PATH}`;
export const LOGO_WIDTH = 960;
export const LOGO_HEIGHT = 960;

export const DEFAULT_OG_IMAGE_PATH = '/images/og-default.jpg';
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
export const DEFAULT_OG_IMAGE_WIDTH = 2752;
export const DEFAULT_OG_IMAGE_HEIGHT = 1536;
export const DEFAULT_OG_IMAGE_ALT =
  'Menschlichkeit Österreich – Verein für Demokratie, Menschenrechte und soziale Gerechtigkeit';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const ORGANIZATION_NAME = SITE_NAME;
export const ORGANIZATION_ALTERNATE_NAME =
  'Verein zur Förderung von Demokratie, Menschenrechten und Zivilgesellschaft';
export const ORGANIZATION_DESCRIPTION =
  'Menschlichkeit Österreich ist ein Verein für Demokratie, Menschenrechte, soziale Gerechtigkeit und zivilgesellschaftliche Teilhabe in Österreich.';
export const LEGAL_FACTS = {
  zvr: '1182213083',
  foundingDateIso: '2025-05-28',
  foundingDateLabel: '28. Mai 2025',
  seat: 'St. Pölten (St. Pölten)',
  mailingAddressLabel: 'Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn',
  registerAuthority: 'Landespolizeidirektion Niederösterreich - Referat SVA 3',
  statutesResolutionLabel: '21. Mai 2025',
  contributionOrderResolutionLabel: '7. Juni 2025',
  contributionOrderEffectiveLabel: '1. Juli 2025',
} as const;

export const POSTAL_ADDRESS = {
  streetAddress: 'Pottenbrunner Hauptstraße 108/Top 1',
  addressLocality: 'Pottenbrunn',
  postalCode: '3140',
  addressCountry: 'AT',
};

export const LEGAL_DOCS = {
  statutes: {
    href: '/docs/statuten-verein-menschlichkeit-oesterreich.pdf',
    label: 'Statuten als PDF',
  },
  contributionRules: {
    href: '/docs/beitragsordnung-verein-menschlichkeit-oesterreich.pdf',
    label: 'Beitragsordnung als PDF',
  },
  registerExcerpt: {
    href: '/docs/vereinsregisterauszug.pdf',
    label: 'Vereinsregisterauszug als PDF',
  },
} as const;

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function toPortalUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${CRM_SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': ORGANIZATION_ID,
    name: ORGANIZATION_NAME,
    alternateName: ORGANIZATION_ALTERNATE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,
    },
    foundingDate: LEGAL_FACTS.foundingDateIso,
    description: ORGANIZATION_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      ...POSTAL_ADDRESS,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT_EMAIL,
      contactType: 'customer service',
      areaServed: 'AT',
      availableLanguage: ['de'],
    },
    potentialAction: [
      {
        '@type': 'DonateAction',
        name: 'Spenden',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/spenden`,
        },
      },
      {
        '@type': 'JoinAction',
        name: 'Mitglied werden',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/mitglied-werden`,
        },
      },
    ],
  };
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: {
      '@id': ORGANIZATION_ID,
    },
  };
}
