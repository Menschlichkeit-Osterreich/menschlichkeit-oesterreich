import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError, request, setUnauthorizedHandler } from './http';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Unauthorized',
    headers: { get: () => 'application/json' },
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(''),
  } as unknown as Response;
}

function textResponse(status: number, body: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 204 ? 'No Content' : 'Bad Request',
    headers: { get: () => 'text/plain' },
    json: vi.fn().mockRejectedValue(new Error('no json')),
    text: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('http.request', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
  });

  it('sendet JSON-Request mit Auth-Header und liest JSON-Antwort', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { ok: true, source: 'api' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await request<{ ok: boolean; source: string }>('/health', {
      method: 'POST',
      token: 'abc',
      body: { probe: true },
      timeoutMs: 100,
    });

    expect(result).toEqual({ ok: true, source: 'api' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8001/health',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ probe: true }),
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer abc',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('liefert Text-Antworten fuer non-json responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(textResponse(204, 'done'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await request<string>('https://example.org/plain', {
      method: 'GET',
    });

    expect(result).toBe('done');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.org/plain',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('wirft HttpError und ruft Unauthorized-Handler bei 401 auf', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { message: 'denied' }));
    const unauthorizedHandler = vi.fn();

    vi.stubGlobal('fetch', fetchMock);
    setUnauthorizedHandler(unauthorizedHandler);

    await expect(request('/private')).rejects.toBeInstanceOf(HttpError);

    await expect(request('/private')).rejects.toMatchObject({
      status: 401,
      body: { message: 'denied' },
    });
    expect(unauthorizedHandler).toHaveBeenCalledTimes(2);
  });
});