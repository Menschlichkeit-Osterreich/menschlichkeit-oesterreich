import { apiClient, ApiResponse } from './client';

// Privacy Types
export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  comments?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  type: 'terms' | 'privacy' | 'marketing' | 'analytics' | 'cookies';
  version: string;
  status: 'granted' | 'revoked';
  grantedAt?: string;
  revokedAt?: string;
  ipAddress: string;
  userAgent: string;
}

export interface CookiePreferences {
  essential: boolean; // Always true, required
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  preferences: boolean;
}

export interface PrivacySettings {
  dataProcessing: {
    personalData: boolean;
    marketingCommunication: boolean;
    analytics: boolean;
    profiling: boolean;
  };
  communication: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    newsletter: boolean;
  };
  sharing: {
    partners: boolean;
    publicProfile: boolean;
    research: boolean;
  };
}

export interface DataProcessingActivity {
  id: string;
  category: string;
  purpose: string;
  dataTypes: string[];
  retention: string;
  recipients: string[];
  legalBasis: string;
  lastUpdated: string;
}

// Privacy Service Class
class PrivacyService {
  // Data Export Requests
  async requestDataExport(): Promise<ApiResponse<{ request: DataExportRequest }>> {
    return apiClient.post<ApiResponse<{ request: DataExportRequest }>>('/privacy/data-export');
  }

  async getDataExportRequests(): Promise<ApiResponse<{ requests: DataExportRequest[] }>> {
    return apiClient.get<ApiResponse<{ requests: DataExportRequest[] }>>('/privacy/data-export');
  }

  async downloadDataExport(requestId: string): Promise<Blob> {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
    const response = await fetch(`${baseUrl}/privacy/data-export/${requestId}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download data export');
    }

    return response.blob();
  }

  // Data Deletion Requests
  async requestDataDeletion(
    reason: string
  ): Promise<ApiResponse<{ request: DataDeletionRequest }>> {
    return apiClient.post<ApiResponse<{ request: DataDeletionRequest }>>('/privacy/data-deletion', {
      reason,
    });
  }

  async getDataDeletionRequests(): Promise<ApiResponse<{ requests: DataDeletionRequest[] }>> {
    return apiClient.get<ApiResponse<{ requests: DataDeletionRequest[] }>>(
      '/privacy/data-deletion'
    );
  }

  // Admin: Process deletion requests
  async processDataDeletionRequest(
    requestId: string,
    action: 'approve' | 'reject',
    comments?: string
  ): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(`/privacy/data-deletion/${requestId}/process`, {
      action,
      comments,
    });
  }

  // Consent Management
  async getConsents(): Promise<ApiResponse<{ consents: ConsentRecord[] }>> {
    return apiClient.get<ApiResponse<{ consents: ConsentRecord[] }>>('/privacy/consents');
  }

  async grantConsent(
    type: ConsentRecord['type'],
    version: string
  ): Promise<ApiResponse<{ consent: ConsentRecord }>> {
    return apiClient.post<ApiResponse<{ consent: ConsentRecord }>>('/privacy/consents', {
      type,
      version,
    });
  }

  async revokeConsent(consentId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(`/privacy/consents/${consentId}`);
  }

  // Cookie Preferences
  async getCookiePreferences(): Promise<ApiResponse<{ preferences: CookiePreferences }>> {
    return apiClient.get<ApiResponse<{ preferences: CookiePreferences }>>('/privacy/cookies');
  }

  async updateCookiePreferences(preferences: CookiePreferences): Promise<ApiResponse> {
    return apiClient.put<ApiResponse>('/privacy/cookies', preferences);
  }

  // Privacy Settings
  async getPrivacySettings(): Promise<ApiResponse<{ settings: PrivacySettings }>> {
    return apiClient.get<ApiResponse<{ settings: PrivacySettings }>>('/privacy/settings');
  }

  async updatePrivacySettings(settings: PrivacySettings): Promise<ApiResponse> {
    return apiClient.put<ApiResponse>('/privacy/settings', settings);
  }

  // Data Processing Activities (DSGVO Article 30)
  async getDataProcessingActivities(): Promise<
    ApiResponse<{ activities: DataProcessingActivity[] }>
  > {
    return apiClient.get<ApiResponse<{ activities: DataProcessingActivity[] }>>(
      '/privacy/processing-activities'
    );
  }

  // Privacy Impact Assessment
  async requestPrivacyImpactAssessment(
    description: string,
    dataTypes: string[],
    risks: string[]
  ): Promise<ApiResponse<{ assessmentId: string }>> {
    return apiClient.post<ApiResponse<{ assessmentId: string }>>('/privacy/impact-assessment', {
      description,
      dataTypes,
      risks,
    });
  }

  // Data Breach Notification
  async reportDataBreach(
    description: string,
    affectedData: string[],
    estimatedAffected: number,
    riskLevel: 'low' | 'medium' | 'high'
  ): Promise<ApiResponse<{ breachId: string }>> {
    return apiClient.post<ApiResponse<{ breachId: string }>>('/privacy/data-breach', {
      description,
      affectedData,
      estimatedAffected,
      riskLevel,
    });
  }

  // Client-side Cookie Management
  setCookie(name: string, value: string, days: number = 365): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict;Secure`;
  }

  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (const c of ca) {
      let cookie = c;
      while (cookie.startsWith(' ')) {
        cookie = cookie.substring(1);
      }
      if (cookie.startsWith(nameEQ)) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Apply Cookie Preferences
  applyCookiePreferences(preferences: CookiePreferences): void {
    // Store preferences
    this.setCookie('cookie_preferences', JSON.stringify(preferences), 365);

    // Apply or remove cookies based on preferences
    if (!preferences.analytics) {
      this.deleteCookie('_ga');
      this.deleteCookie('_gid');
      this.deleteCookie('_gat');
    }

    if (!preferences.marketing) {
      this.deleteCookie('_fbp');
      this.deleteCookie('_fbc');
      // Remove marketing pixels
    }

    if (!preferences.functional) {
      // Remove functional cookies
      this.deleteCookie('preferences');
    }

    // Essential cookies are always kept
  }

  // Check if cookies are accepted
  areCookiesAccepted(): boolean {
    return this.getCookie('cookies_accepted') === 'true';
  }

  // Accept all cookies
  acceptAllCookies(): void {
    const allPreferences: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      preferences: true,
    };
    this.applyCookiePreferences(allPreferences);
    this.setCookie('cookies_accepted', 'true', 365);
  }

  // Reject non-essential cookies
  rejectNonEssentialCookies(): void {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      preferences: false,
    };
    this.applyCookiePreferences(essentialOnly);
    this.setCookie('cookies_accepted', 'true', 365);
  }

  // DSGVO-compliant data processing descriptions
  getDataProcessingDescriptions(): Record<string, string> {
    return {
      authentication: 'Zur Identifikation und Authentifizierung der Nutzer',
      communication: 'Für die Kommunikation mit Vereinsmitgliedern und Interessenten',
      donations: 'Zur Verwaltung von Spenden und SEPA-Mandaten',
      analytics: 'Zur Analyse der Webseitennutzung und Verbesserung unserer Dienste',
      marketing: 'Für zielgerichtete Werbung und Newsletter-Versendung',
      legal: 'Zur Erfüllung rechtlicher Verpflichtungen',
      security: 'Zum Schutz vor Missbrauch und zur IT-Sicherheit',
    };
  }

  // Legal basis descriptions (DSGVO Article 6)
  getLegalBasisDescriptions(): Record<string, string> {
    return {
      consent: 'Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)',
      contract: 'Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)',
      legal_obligation: 'Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO)',
      vital_interests: 'Lebenswichtige Interessen (Art. 6 Abs. 1 lit. d DSGVO)',
      public_task: 'Öffentliche Aufgabe (Art. 6 Abs. 1 lit. e DSGVO)',
      legitimate_interest: 'Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)',
    };
  }

  // Format consent status for display
  formatConsentStatus(consent: ConsentRecord): string {
    if (consent.status === 'granted') {
      return `Erteilt am ${new Date(consent.grantedAt!).toLocaleDateString('de-AT')}`;
    } else {
      return `Widerrufen am ${new Date(consent.revokedAt!).toLocaleDateString('de-AT')}`;
    }
  }

  // Check if consent is required for processing
  isConsentRequired(processingType: string): boolean {
    const consentRequiredTypes = ['marketing', 'analytics', 'profiling'];
    return consentRequiredTypes.includes(processingType);
  }
}

// Export singleton instance
export const privacyService = new PrivacyService();
export default privacyService;
