/**
 * Verschlüsselter Storage-Wrapper (Defense-in-Depth).
 *
 * Verschlüsselt Werte mit AES-GCM bevor sie in localStorage/sessionStorage
 * geschrieben werden. Der Schlüssel wird via PBKDF2 aus einem App-Seed
 * abgeleitet und im Speicher gehalten.
 *
 * HINWEIS: Dies ist kein Ersatz für serverseitige Sicherheit. Ein XSS-Angriff
 * im selben JS-Kontext kann den Schlüssel theoretisch extrahieren. Der Nutzen
 * liegt in der Erschwerung von:
 * - Auslesen durch Browser-Extensions
 * - Token-Harvesting durch automatisierte Tools
 * - Zufälliger Einsicht in DevTools
 */

const APP_SEED = 'moe-secure-storage-v1';
const SALT = new Uint8Array([109, 111, 101, 45, 115, 97, 108, 116, 45, 50, 48, 50, 54]);

let cachedKey: CryptoKey | null = null;

async function deriveKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(APP_SEED),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  cachedKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  return cachedKey;
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await deriveKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );

  // Combine IV + ciphertext and base64-encode
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decrypt(encoded: string): Promise<string> {
  const key = await deriveKey();
  const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}

type StorageBackend = 'local' | 'session';

const noopStorage: Storage = {
  length: 0,
  clear() {},
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {},
  setItem() {},
};

function getBackend(backend: StorageBackend): Storage {
  if (typeof window === 'undefined') {
    return noopStorage;
  }

  try {
    return backend === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return noopStorage;
  }
}

/**
 * Verschlüsselten Wert in Storage schreiben.
 */
export async function secureSet(
  key: string,
  value: string,
  backend: StorageBackend = 'local',
): Promise<void> {
  try {
    const encrypted = await encrypt(value);
    getBackend(backend).setItem(key, encrypted);
  } catch {
    // Fallback: unverschlüsselt speichern (z.B. wenn SubtleCrypto nicht verfügbar)
    getBackend(backend).setItem(key, value);
  }
}

/**
 * Verschlüsselten Wert aus Storage lesen.
 */
export async function secureGet(
  key: string,
  backend: StorageBackend = 'local',
): Promise<string | null> {
  const raw = getBackend(backend).getItem(key);
  if (!raw) return null;

  try {
    return await decrypt(raw);
  } catch {
    // Fallback: Wert wurde unverschlüsselt gespeichert (Migration)
    return raw;
  }
}

/**
 * Wert aus Storage entfernen.
 */
export function secureRemove(key: string, backend: StorageBackend = 'local'): void {
  getBackend(backend).removeItem(key);
}
