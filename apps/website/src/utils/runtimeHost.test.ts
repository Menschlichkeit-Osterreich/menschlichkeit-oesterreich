import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PUBLIC_PORTAL_ENTRY_PATH,
  buildPortalProbeUrl,
  buildPortalUrl,
  buildPublicUrl,
  getRuntimeHostVariant,
  isPortalHost,
  isPortalPath,
  mapLegacyPortalPath,
  toHostAwarePath,
  toPublicAwarePath,
} from './runtimeHost';

describe('runtimeHost', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('respektiert die konfigurierte Host-Variante aus VITE_HOST_VARIANT', () => {
    vi.stubEnv('VITE_HOST_VARIANT', 'crm');
    expect(getRuntimeHostVariant()).toBe('crm');
    expect(isPortalHost()).toBe(true);

    vi.stubEnv('VITE_HOST_VARIANT', 'public');
    expect(getRuntimeHostVariant()).toBe('public');
    expect(isPortalHost()).toBe(false);
  });

  it('baut Host-URLs und Host-aware-Pfade konsistent', () => {
    vi.stubEnv('VITE_HOST_VARIANT', 'crm');
    expect(buildPortalUrl('member/profil')).toBe(
      'https://crm.menschlichkeit-oesterreich.at/member/profil'
    );
    expect(buildPortalProbeUrl()).toBe('https://crm.menschlichkeit-oesterreich.at/favicon.svg');
    expect(toHostAwarePath(PUBLIC_PORTAL_ENTRY_PATH)).toBe(PUBLIC_PORTAL_ENTRY_PATH);
    expect(toPublicAwarePath('/mitglied-werden')).toBe(
      'https://www.menschlichkeit-oesterreich.at/mitglied-werden'
    );

    vi.stubEnv('VITE_HOST_VARIANT', 'public');
    expect(buildPublicUrl('spenden')).toBe('https://www.menschlichkeit-oesterreich.at/spenden');
    expect(toHostAwarePath('/login')).toBe('https://crm.menschlichkeit-oesterreich.at/login');
    expect(toPublicAwarePath('/kontakt')).toBe('/kontakt');
  });

  it('mapped Legacy-Portal-Pfade und erkennt Portal-Routen korrekt', () => {
    expect(mapLegacyPortalPath('/account/profile')).toBe('/member/profil');
    expect(mapLegacyPortalPath('/account/sepa')).toBe('/member/sepa');
    expect(mapLegacyPortalPath('/sonstiges')).toBe('/sonstiges');

    expect(isPortalPath('/login')).toBe(true);
    expect(isPortalPath('/member/sepa')).toBe(true);
    expect(isPortalPath('/admin/dashboard')).toBe(true);
    expect(isPortalPath('/spenden')).toBe(false);
  });
});