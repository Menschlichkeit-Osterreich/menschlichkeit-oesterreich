/**
 * Zentrale API-URL-Konfiguration.
 * Alle Seiten und Services sollen diese Konstanten importieren
 * statt eigene API_BASE-Variablen zu definieren.
 */

/** Legacy-API (Port 8000) — CRM/CiviCRM-Integration */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** Neue API v2 (Port 8001) — FastAPI Backend */
export const API_V2_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

/** OpenClaw Windows-Bridge */
export const OPENCLAW_BRIDGE_URL =
  import.meta.env.VITE_OPENCLAW_BRIDGE_URL || 'http://127.0.0.1:18790';

/** CiviCRM REST-API */
export const CIVICRM_BASE_URL =
  import.meta.env.VITE_CIVICRM_BASE_URL || 'https://crm.menschlichkeit-oesterreich.at';
export const CIVICRM_API_ENDPOINT =
  import.meta.env.VITE_CIVICRM_API_ENDPOINT || '/api/v4';
