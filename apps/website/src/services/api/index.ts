// API Services Index
export { apiClient, ApiError } from './client';
export type { ApiResponse, PaginatedResponse } from './client';

export { authService } from './auth';
export type {
  User,
  LoginCredentials,
  RegisterData,
  LoginResponse,
  TwoFactorSetupResponse,
  PasswordResetRequest,
  PasswordReset,
  ChangePasswordRequest,
} from './auth';

export { sepaService } from './sepa';
export type {
  SepaMandate,
  SepaMandateRequest,
  IbanValidationResult,
  SepaTransaction,
} from './sepa';

export { privacyService } from './privacy';
export type {
  DataExportRequest,
  DataDeletionRequest,
  ConsentRecord,
  CookiePreferences,
  PrivacySettings,
  DataProcessingActivity,
} from './privacy';

// Import for re-export
import { apiClient } from './client';
import { authService } from './auth';
import { sepaService } from './sepa';
import { privacyService } from './privacy';

// Re-export all services as default exports for convenience
export default {
  api: apiClient,
  auth: authService,
  sepa: sepaService,
  privacy: privacyService,
};
