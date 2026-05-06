import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '@/constants/storage';

const apiClientMock = {
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  setToken: vi.fn(),
};

const secureGetMock = vi.fn();
const secureRemoveMock = vi.fn();
const secureSetMock = vi.fn();

async function loadAuthModule() {
  vi.doMock('./client', () => ({
    apiClient: apiClientMock,
  }));
  vi.doMock('@/utils/secureStorage', () => ({
    secureGet: secureGetMock,
    secureRemove: secureRemoveMock,
    secureSet: secureSetMock,
  }));

  return import('./auth');
}

describe('authService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('speichert bei erfolgreichem Login User und Refresh-Token', async () => {
    apiClientMock.post.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'anna@example.at',
          firstName: 'Anna',
          lastName: 'Muster',
          role: 'member',
          isEmailVerified: true,
          twoFactorEnabled: false,
          createdAt: '2026-04-21T00:00:00Z',
          updatedAt: '2026-04-21T00:00:00Z',
        },
        token: 'auth-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      },
    });

    const { authService } = await loadAuthModule();

    const response = await authService.login({
      email: 'anna@example.at',
      password: 'sicher',
    });

    expect(response.success).toBe(true);
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.getCurrentUser()?.email).toBe('anna@example.at');
    expect(apiClientMock.setToken).toHaveBeenCalledWith('auth-token');
    expect(secureSetMock).toHaveBeenCalledWith(STORAGE_KEYS.refreshToken, 'refresh-token');
  });

  it('räumt beim Logout Tokens lokal auf, auch wenn der API-Call fehlschlägt', async () => {
    apiClientMock.post
      .mockResolvedValueOnce({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'anna@example.at',
            firstName: 'Anna',
            lastName: 'Muster',
            role: 'member',
            isEmailVerified: true,
            twoFactorEnabled: false,
            createdAt: '2026-04-21T00:00:00Z',
            updatedAt: '2026-04-21T00:00:00Z',
          },
          token: 'auth-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        },
      })
      .mockRejectedValueOnce(new Error('offline'));

    const { authService } = await loadAuthModule();

    await authService.login({ email: 'anna@example.at', password: 'sicher' });
    await authService.logout();

    expect(authService.isAuthenticated()).toBe(false);
    expect(apiClientMock.setToken).toHaveBeenLastCalledWith(null);
    expect(secureRemoveMock).toHaveBeenCalledWith(STORAGE_KEYS.refreshToken);
    expect(secureRemoveMock).toHaveBeenCalledWith(STORAGE_KEYS.authToken);
  });

  it('bricht Token-Refresh ohne gespeicherten Refresh-Token sofort ab', async () => {
    secureGetMock.mockResolvedValue(null);

    const { authService } = await loadAuthModule();

    await expect(authService.refreshToken()).resolves.toBe(false);
    expect(apiClientMock.post).not.toHaveBeenCalled();
  });

  it('initialisiert sich aus gespeichertem Auth-Token und lädt den aktuellen Benutzer', async () => {
    secureGetMock.mockResolvedValue('stored-auth-token');
    apiClientMock.get.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: '7',
          email: 'vorstand@example.at',
          firstName: 'Vorstand',
          lastName: 'Team',
          role: 'admin',
          isEmailVerified: true,
          twoFactorEnabled: true,
          createdAt: '2026-04-21T00:00:00Z',
          updatedAt: '2026-04-21T00:00:00Z',
        },
      },
    });

    const { authService } = await loadAuthModule();

    await expect(authService.initializeFromToken()).resolves.toBe(true);
    expect(apiClientMock.setToken).toHaveBeenCalledWith('stored-auth-token');
    expect(authService.isAdmin()).toBe(true);
    expect(authService.isModerator()).toBe(true);
  });
});