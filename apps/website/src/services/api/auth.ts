import { apiClient, ApiResponse } from './client';

// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator' | 'member';
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export type LoginResponse = ApiResponse<{
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}>;

export type TwoFactorSetupResponse = ApiResponse<{
  qrCode: string;
  backupCodes: string[];
  secret: string;
}>;

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Auth Service Class
class AuthService {
  private currentUser: User | null = null;

  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    if (response.success && response.data) {
      this.currentUser = response.data.user;
      apiClient.setToken(response.data.token);

      // Store refresh token
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }

    return response;
  }

  // Register
  async register(data: RegisterData): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data);
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      this.currentUser = null;
      apiClient.setToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token');
    }
  }

  // Get Current User
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Refresh Token
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.success && response.data) {
        this.currentUser = response.data.user;
        apiClient.setToken(response.data.token);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout(); // Clear invalid tokens
    }

    return false;
  }

  // Verify Email
  async verifyEmail(token: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/verify-email', { token });
  }

  // Resend Verification Email
  async resendVerificationEmail(): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/resend-verification');
  }

  // Password Reset Request
  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/password-reset-request', data);
  }

  // Password Reset
  async resetPassword(data: PasswordReset): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/password-reset', data);
  }

  // Change Password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/change-password', data);
  }

  // Two-Factor Authentication
  async setupTwoFactor(): Promise<TwoFactorSetupResponse> {
    return apiClient.post<TwoFactorSetupResponse>('/auth/2fa/setup');
  }

  async enableTwoFactor(token: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return apiClient.post<ApiResponse<{ backupCodes: string[] }>>('/auth/2fa/enable', { token });
  }

  async disableTwoFactor(password: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/2fa/disable', { password });
  }

  async verifyTwoFactor(token: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/2fa/verify', { token });
  }

  // Session Management
  async getSessions(): Promise<
    ApiResponse<
      Array<{
        id: string;
        deviceInfo: string;
        location: string;
        lastActivity: string;
        isCurrent: boolean;
      }>
    >
  > {
    return apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          deviceInfo: string;
          location: string;
          lastActivity: string;
          isCurrent: boolean;
        }>
      >
    >('/auth/sessions');
  }

  async revokeSession(sessionId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(`/auth/sessions/${sessionId}`);
  }

  async revokeAllSessions(): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/sessions/revoke-all');
  }

  // Profile Management
  async updateProfile(
    data: Partial<Pick<User, 'firstName' | 'lastName'>>
  ): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', data);

    if (response.success && response.data) {
      this.currentUser = response.data.user;
    }

    return response;
  }

  async deleteAccount(password: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/delete-account', { password });
  }

  // Security Logs
  async getSecurityLogs(): Promise<
    ApiResponse<
      Array<{
        id: string;
        action: string;
        description: string;
        ipAddress: string;
        userAgent: string;
        createdAt: string;
      }>
    >
  > {
    return apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          action: string;
          description: string;
          ipAddress: string;
          userAgent: string;
          createdAt: string;
        }>
      >
    >('/auth/security-logs');
  }

  // Check Authentication Status
  isAuthenticated(): boolean {
    return this.currentUser !== null && !!localStorage.getItem('auth_token');
  }

  // Check User Role
  hasRole(role: User['role']): boolean {
    return this.currentUser?.role === role;
  }

  // Check Admin Access
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check Moderator Access
  isModerator(): boolean {
    return this.hasRole('admin') || this.hasRole('moderator');
  }

  // Initialize from stored token
  async initializeFromToken(): Promise<boolean> {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      apiClient.setToken(token);
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');

      if (response.success && response.data) {
        this.currentUser = response.data.user;
        return true;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      // Try to refresh token
      return await this.refreshToken();
    }

    return false;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
