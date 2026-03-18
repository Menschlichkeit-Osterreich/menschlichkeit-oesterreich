export const DOMAIN = 'menschlichkeit-oesterreich.at';
export const PUBLIC_CONTACT_EMAIL = `office@${DOMAIN}`;
export const WHATSAPP_URL = 'https://wa.me/436801608053';

export const EMAIL = {
  kontakt: PUBLIC_CONTACT_EMAIL,
  office: PUBLIC_CONTACT_EMAIL,
  info: `info@${DOMAIN}`,
  admin: `admin@${DOMAIN}`,
  noreply: `noreply@${DOMAIN}`,
  support: `support@${DOMAIN}`,
  finanzen: `finanzen@${DOMAIN}`,
  vorstand: `vorstand@${DOMAIN}`,
  datenschutz: `datenschutz@${DOMAIN}`,
} as const;

export const ORGANIZATION = {
  name: 'Verein Menschlichkeit Österreich',
  zvr: '1182213083',
  gruendung: '28.05.2025',
  sitz: 'St. Pölten (St. Pölten)',
  zustellanschrift: 'Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn',
  adresse: 'Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn',
  vereinsbehoerde: 'Landespolizeidirektion Niederösterreich - Referat SVA 3',
  website: `https://www.${DOMAIN}`,
} as const;

export const MEMBERSHIP_TYPES = {
  ordentlich: { label: 'Ordentliches Mitglied', beitrag: 3600 },
  ermaessigt: { label: 'Ermäßigtes Mitglied', beitrag: 1800 },
  ausserordentlich: { label: 'Außerordentliches Mitglied', beitrag: 0 },
  haertefall: { label: 'Härtefall (beitragsfrei)', beitrag: 0 },
  ehrenmitglied: { label: 'Ehrenmitglied', beitrag: 0 },
} as const;

export const ROLES = {
  guest: { label: 'Gast', level: 0 },
  member: { label: 'Mitglied', level: 1 },
  moderator: { label: 'Moderator*in', level: 2 },
  admin: { label: 'Administrator*in', level: 3 },
  sysadmin: { label: 'Systemadministrator*in', level: 4 },
} as const;

export const GOVERNANCE = {
  organe: {
    mitgliederversammlung: 'Mitgliederversammlung',
    vorstand: 'Vorstand',
    rechnungspruefer: 'Rechnungsprüfer*innen',
    schiedsgericht: 'Schiedsgericht',
  },
  vorstand: {
    obperson: 'Obperson',
    stellvertretung: 'Stellvertretende Obperson',
    kassierin: 'Kassier*in',
    schriftfuehrerin: 'Schriftführer*in',
  },
  funktionsperiode: 'bis zu 5 Jahre',
} as const;
