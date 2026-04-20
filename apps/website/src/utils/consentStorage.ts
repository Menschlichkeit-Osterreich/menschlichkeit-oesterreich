export const COOKIE_PREFERENCES_KEY = 'cookie-preferences';
export const LEGACY_COOKIE_CONSENT_KEY = 'moe_cookie_consent';
export const COOKIE_PREFERENCES_UPDATED_EVENT = 'moe:cookie-preferences-updated';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  socialMedia: boolean;
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
  socialMedia: false,
};

type LegacyConsentValue =
  | string
  | {
      accepted?: boolean;
      necessary?: boolean;
      essential?: boolean;
      analytics?: boolean;
      marketing?: boolean;
      personalization?: boolean;
      external?: boolean;
      socialMedia?: boolean;
    };

function normalizeCookiePreferences(
  value: Partial<CookiePreferences> | null | undefined
): CookiePreferences {
  return {
    essential: true,
    analytics: value?.analytics ?? false,
    marketing: value?.marketing ?? false,
    personalization: value?.personalization ?? false,
    socialMedia: value?.socialMedia ?? false,
  };
}

export function loadConsentPreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<CookiePreferences>;
    return normalizeCookiePreferences(parsedValue);
  } catch {
    return null;
  }
}

export function saveConsentPreferences(preferences: Partial<CookiePreferences>): CookiePreferences {
  const normalizedPreferences = normalizeCookiePreferences(preferences);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(normalizedPreferences));
    window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_UPDATED_EVENT));
  }

  return normalizedPreferences;
}

export function migrateOldConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const existingPreferences = loadConsentPreferences();
  const legacyConsent = window.localStorage.getItem(LEGACY_COOKIE_CONSENT_KEY);

  if (existingPreferences) {
    if (legacyConsent) {
      window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
    }
    return existingPreferences;
  }

  if (!legacyConsent) {
    return null;
  }

  let oldValue: LegacyConsentValue;
  try {
    oldValue = JSON.parse(legacyConsent) as LegacyConsentValue;
  } catch {
    oldValue = legacyConsent;
  }

  const isAcceptedString = oldValue === 'accepted' || oldValue === 'all';
  const isRejectedString = oldValue === 'rejected' || oldValue === 'essential';
  const acceptedFlag =
    typeof oldValue === 'object' && oldValue !== null ? oldValue.accepted === true : false;
  const accepted = isAcceptedString || acceptedFlag;

  const analyticsFromLegacy =
    typeof oldValue === 'object' && oldValue !== null
      ? (oldValue.analytics ?? oldValue.external ?? false)
      : false;
  const marketingFromLegacy =
    typeof oldValue === 'object' && oldValue !== null ? (oldValue.marketing ?? false) : false;
  const personalizationFromLegacy =
    typeof oldValue === 'object' && oldValue !== null ? (oldValue.personalization ?? false) : false;
  const socialMediaFromLegacy =
    typeof oldValue === 'object' && oldValue !== null
      ? (oldValue.socialMedia ?? oldValue.external ?? false)
      : false;

  // Conservative migration: string values migrate to essential-only unless explicit accepted/all.
  const migratedPreferences = saveConsentPreferences({
    essential: true,
    analytics: accepted ? true : isRejectedString ? false : analyticsFromLegacy,
    marketing: accepted ? true : isRejectedString ? false : marketingFromLegacy,
    personalization: accepted ? true : isRejectedString ? false : personalizationFromLegacy,
    socialMedia: accepted ? true : isRejectedString ? false : socialMediaFromLegacy,
  });
  window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);

  return migratedPreferences;
}
