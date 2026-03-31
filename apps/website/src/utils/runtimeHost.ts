import { CRM_SITE_URL, SITE_URL } from '@/config/siteConfig';

export type HostVariant = 'public' | 'crm';

function normalizePath(path = '/'): string {
  if (!path) {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

function getConfiguredVariant(): HostVariant | null {
  const configured = import.meta.env.VITE_HOST_VARIANT?.toString().trim().toLowerCase();
  return configured === 'crm' || configured === 'public' ? configured : null;
}

export function getRuntimeHostVariant(): HostVariant {
  const configured = getConfiguredVariant();
  if (configured) {
    return configured;
  }

  if (typeof window === 'undefined') {
    return 'public';
  }

  const hostname = window.location.hostname.toLowerCase();
  const crmHostname = new URL(CRM_SITE_URL).hostname.toLowerCase();

  if (hostname === crmHostname || hostname.startsWith('crm.')) {
    return 'crm';
  }

  return 'public';
}

export function isPortalHost(): boolean {
  return getRuntimeHostVariant() === 'crm';
}

export function buildPublicUrl(path = '/'): string {
  return new URL(normalizePath(path), SITE_URL).toString();
}

export function buildPortalUrl(path = '/'): string {
  return new URL(normalizePath(path), CRM_SITE_URL).toString();
}

export function toHostAwarePath(path = '/'): string {
  return isPortalHost() ? normalizePath(path) : buildPortalUrl(path);
}

export function toPublicAwarePath(path = '/'): string {
  return isPortalHost() ? buildPublicUrl(path) : normalizePath(path);
}

export function mapLegacyPortalPath(pathname: string): string {
  if (pathname === '/account/profile') return '/member/profil';
  if (pathname === '/account/sepa') return '/member/sepa';
  if (pathname === '/account/receipts') return '/member/rechnungen';
  if (pathname === '/account/newsletter') return '/member/newsletter';
  if (pathname === '/account/privacy') return '/member/datenschutz';

  return pathname;
}

export function isPortalPath(pathname: string): boolean {
  return /^\/(login|passwort-vergessen|passwort-reset|member|admin|account)(\/|$)/.test(pathname);
}
