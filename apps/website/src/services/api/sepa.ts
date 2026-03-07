import { apiClient, ApiResponse, PaginatedResponse } from './client';

// SEPA Types
export interface SepaMandate {
  id: string;
  mandateId: string;
  userId: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      houseNumber: string;
      postalCode: string;
      city: string;
      country: string;
    };
  };
  bankData: {
    iban: string;
    bic?: string;
    bankName: string;
    accountHolder: string;
  };
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'once';
  purpose: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SepaMandateRequest {
  personalData: SepaMandate['personalData'];
  bankData: Pick<SepaMandate['bankData'], 'iban' | 'accountHolder'>;
  amount: number;
  frequency: SepaMandate['frequency'];
  purpose: string;
}

export interface IbanValidationResult {
  valid: boolean;
  iban: string;
  bic?: string;
  bankName?: string;
  country: string;
  error?: string;
}

export interface SepaTransaction {
  id: string;
  mandateId: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed' | 'returned';
  processedAt?: string;
  error?: string;
  createdAt: string;
}

// SEPA Service Class
class SepaService {
  // Validate IBAN
  async validateIban(iban: string): Promise<ApiResponse<IbanValidationResult>> {
    return apiClient.post<ApiResponse<IbanValidationResult>>('/sepa/validate-iban', { iban });
  }

  // Create SEPA Mandate
  async createMandate(data: SepaMandateRequest): Promise<ApiResponse<{ mandate: SepaMandate }>> {
    return apiClient.post<ApiResponse<{ mandate: SepaMandate }>>('/sepa/mandates', data);
  }

  // Get User's Mandates
  async getMandates(params?: {
    status?: SepaMandate['status'];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SepaMandate>> {
    return apiClient.get<PaginatedResponse<SepaMandate>>('/sepa/mandates', params);
  }

  // Get Specific Mandate
  async getMandate(mandateId: string): Promise<ApiResponse<{ mandate: SepaMandate }>> {
    return apiClient.get<ApiResponse<{ mandate: SepaMandate }>>(`/sepa/mandates/${mandateId}`);
  }

  // Update Mandate
  async updateMandate(
    mandateId: string,
    data: Partial<SepaMandateRequest>
  ): Promise<ApiResponse<{ mandate: SepaMandate }>> {
    return apiClient.put<ApiResponse<{ mandate: SepaMandate }>>(
      `/sepa/mandates/${mandateId}`,
      data
    );
  }

  // Cancel Mandate
  async cancelMandate(mandateId: string, reason?: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(`/sepa/mandates/${mandateId}/cancel`, { reason });
  }

  // Suspend Mandate
  async suspendMandate(mandateId: string, reason?: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(`/sepa/mandates/${mandateId}/suspend`, { reason });
  }

  // Reactivate Mandate
  async reactivateMandate(mandateId: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(`/sepa/mandates/${mandateId}/reactivate`);
  }

  // Download Mandate PDF
  async downloadMandatePdf(mandateId: string): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/sepa/mandates/${mandateId}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    return response.blob();
  }

  // Get Mandate Transactions
  async getMandateTransactions(
    mandateId: string,
    params?: {
      status?: SepaTransaction['status'];
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<SepaTransaction>> {
    return apiClient.get<PaginatedResponse<SepaTransaction>>(
      `/sepa/mandates/${mandateId}/transactions`,
      params
    );
  }

  // Get All Transactions (Admin)
  async getAllTransactions(params?: {
    mandateId?: string;
    status?: SepaTransaction['status'];
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SepaTransaction>> {
    return apiClient.get<PaginatedResponse<SepaTransaction>>('/sepa/transactions', params);
  }

  // Process Manual Transaction (Admin)
  async processTransaction(transactionId: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(`/sepa/transactions/${transactionId}/process`);
  }

  // Mark Transaction as Failed (Admin)
  async markTransactionFailed(transactionId: string, error: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(`/sepa/transactions/${transactionId}/fail`, { error });
  }

  // Get Austrian Banks (for BIC lookup)
  async getAustrianBanks(query?: string): Promise<
    ApiResponse<
      Array<{
        bic: string;
        name: string;
        city: string;
      }>
    >
  > {
    const params = query ? { query } : undefined;
    return apiClient.get<
      ApiResponse<
        Array<{
          bic: string;
          name: string;
          city: string;
        }>
      >
    >('/sepa/banks/austria', params);
  }

  // SEPA Statistics (Admin)
  async getSepaStats(): Promise<
    ApiResponse<{
      totalMandates: number;
      activeMandates: number;
      totalAmount: number;
      monthlyAmount: number;
      transactionsByStatus: Record<SepaTransaction['status'], number>;
      recentTransactions: SepaTransaction[];
    }>
  > {
    return apiClient.get<
      ApiResponse<{
        totalMandates: number;
        activeMandates: number;
        totalAmount: number;
        monthlyAmount: number;
        transactionsByStatus: Record<SepaTransaction['status'], number>;
        recentTransactions: SepaTransaction[];
      }>
    >('/sepa/statistics');
  }

  // Validate Austrian Postal Code
  validateAustrianPostalCode(postalCode: string): boolean {
    const austrianPostalRegex = /^[1-9]\d{3}$/;
    return austrianPostalRegex.test(postalCode);
  }

  // Format IBAN for Display
  formatIban(iban: string): string {
    return iban
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  }

  // Validate IBAN Format (Client-side)
  validateIbanFormat(iban: string): boolean {
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/;
    const cleanIban = iban.replace(/\s/g, '');
    return ibanRegex.test(cleanIban);
  }

  // Calculate IBAN Check Digits (Client-side validation)
  calculateIbanChecksum(iban: string): boolean {
    const cleanIban = iban.replace(/\s/g, '');
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);

    let numericString = '';
    for (const char of rearranged) {
      if (/[A-Z]/.test(char)) {
        numericString += (char.charCodeAt(0) - 55).toString();
      } else {
        numericString += char;
      }
    }

    return this.mod97(numericString) === 1;
  }

  private mod97(numericString: string): number {
    let remainder = 0;
    for (const digit of numericString) {
      remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
    }
    return remainder;
  }

  // Format Amount for Display
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  // Frequency Display Names
  getFrequencyDisplayName(frequency: SepaMandate['frequency']): string {
    const displayNames: Record<SepaMandate['frequency'], string> = {
      once: 'Einmalig',
      monthly: 'Monatlich',
      quarterly: 'Vierteljährlich',
      yearly: 'Jährlich',
    };
    return displayNames[frequency];
  }

  // Status Display Names
  getStatusDisplayName(status: SepaMandate['status']): string {
    const displayNames: Record<SepaMandate['status'], string> = {
      pending: 'Ausstehend',
      active: 'Aktiv',
      suspended: 'Pausiert',
      cancelled: 'Storniert',
    };
    return displayNames[status];
  }

  // Get Status Color
  getStatusColor(status: SepaMandate['status']): string {
    const colors: Record<SepaMandate['status'], string> = {
      pending: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      active: 'text-green-600 bg-green-100 border-green-200',
      suspended: 'text-orange-600 bg-orange-100 border-orange-200',
      cancelled: 'text-red-600 bg-red-100 border-red-200',
    };
    return colors[status];
  }
}

// Export singleton instance
export const sepaService = new SepaService();
export default sepaService;
