/**
 * Zentrale API-URL-Konfiguration.
 * Alle Seiten und Services sollen diese Konstanten importieren
 * statt eigene API_BASE-Variablen zu definieren.
 */

const DEFAULT_FASTAPI_ORIGIN = 'http://localhost:8001';
const apiOriginFromV2Url = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : '';

/** Kanonischer FastAPI-Origin ohne /api-Suffix */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || apiOriginFromV2Url || DEFAULT_FASTAPI_ORIGIN;

/** Kanonische FastAPI-API inklusive /api */
export const API_V2_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`;

/** CiviCRM REST-API */
export const CIVICRM_BASE_URL =
  import.meta.env.VITE_CIVICRM_BASE_URL || 'https://crm.menschlichkeit-oesterreich.at';
export const CIVICRM_API_ENDPOINT = import.meta.env.VITE_CIVICRM_API_ENDPOINT || '/api/v4';
