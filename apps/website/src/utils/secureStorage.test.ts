import { beforeEach, describe, expect, it, vi } from 'vitest';

function createStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe('secureStorage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();

    const localStorage = createStorageMock();
    const sessionStorage = createStorageMock();

    vi.stubGlobal('window', {
      localStorage,
      sessionStorage,
    });
  });

  it('verschlüsselt Werte vor dem Speichern und liest sie wieder entschlüsselt zurück', async () => {
    const importKey = vi.fn().mockResolvedValue('key-material');
    const deriveKey = vi.fn().mockResolvedValue('derived-key');
    const encrypt = vi.fn().mockResolvedValue(new Uint8Array([10, 20, 30, 40]).buffer);
    const decrypt = vi.fn().mockResolvedValue(new TextEncoder().encode('geheim').buffer);

    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => {
        array.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        return array;
      },
      subtle: {
        importKey,
        deriveKey,
        encrypt,
        decrypt,
      },
    });

    const { secureGet, secureSet } = await import('./secureStorage');

    await secureSet('token', 'geheim');

    expect(window.localStorage.getItem('token')).not.toBe('geheim');
    await expect(secureGet('token')).resolves.toBe('geheim');
    expect(importKey).toHaveBeenCalledTimes(1);
    expect(deriveKey).toHaveBeenCalledTimes(1);
  });

  it('fällt beim Schreiben auf Klartext zurück, wenn WebCrypto nicht verfügbar ist', async () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => array,
      subtle: {
        importKey: vi.fn().mockResolvedValue('key-material'),
        deriveKey: vi.fn().mockResolvedValue('derived-key'),
        encrypt: vi.fn().mockRejectedValue(new Error('crypto down')),
        decrypt: vi.fn(),
      },
    });

    const { secureSet } = await import('./secureStorage');

    await secureSet('token', 'fallback');

    expect(window.localStorage.getItem('token')).toBe('fallback');
  });

  it('liefert unverschlüsselte Altwerte zurück, wenn die Entschlüsselung fehlschlägt', async () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => array,
      subtle: {
        importKey: vi.fn().mockResolvedValue('key-material'),
        deriveKey: vi.fn().mockResolvedValue('derived-key'),
        encrypt: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
        decrypt: vi.fn().mockRejectedValue(new Error('legacy value')),
      },
    });

    window.localStorage.setItem('legacy', 'plain-text-token');

    const { secureGet, secureRemove } = await import('./secureStorage');

    await expect(secureGet('legacy')).resolves.toBe('plain-text-token');
    secureRemove('legacy');
    expect(window.localStorage.getItem('legacy')).toBeNull();
  });
});