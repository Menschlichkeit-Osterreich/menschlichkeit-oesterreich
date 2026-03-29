import { API_V2_URL } from '@/constants/api';
import { STORAGE_KEYS } from '@/constants/storage';
import { secureSet, secureGet, secureRemove } from '@/utils/secureStorage';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Client Class
class ApiClient {
  private readonly baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_V2_URL) {
    this.baseURL = baseURL;
    // Synchroner Fallback für sofortigen Zugriff
    this.token = localStorage.getItem(STORAGE_KEYS.authToken);
    // Asynchron den verschlüsselten Wert laden (überschreibt ggf. den Fallback)
    this.loadEncryptedToken();
  }

  private async loadEncryptedToken(): Promise<void> {
    const decrypted = await secureGet(STORAGE_KEYS.authToken);
    if (decrypted) {
      this.token = decrypted;
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      secureSet(STORAGE_KEYS.authToken, token).catch(() => {
        // Fallback: unverschlüsselt speichern
        localStorage.setItem(STORAGE_KEYS.authToken, token);
      });
    } else {
      secureRemove(STORAGE_KEYS.authToken);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.message ||
          errorData?.error?.message ||
          errorData?.detail ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(
          message,
          response.status,
          errorData?.code || errorData?.error?.code
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return response.text() as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(error instanceof Error ? error.message : 'Network error', 0);
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File Upload
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
