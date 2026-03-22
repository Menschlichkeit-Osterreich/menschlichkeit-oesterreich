/**
 * Zentrale localStorage/sessionStorage-Schlüssel.
 * Verhindert Tippfehler und Inkonsistenzen bei Storage-Zugriffen.
 */
export const STORAGE_KEYS = {
  authToken: 'moe_auth_token',
  refreshToken: 'moe_refresh_token',
  cookieConsent: 'moe_cookie_consent',
  theme: 'theme',
} as const;
