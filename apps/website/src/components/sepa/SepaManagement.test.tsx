import { describe, it, expect } from 'vitest';
import { validateIban } from './SepaManagement';

describe('validateIban', () => {
  // Test case for the bug: A valid German IBAN
  it('should correctly validate a valid German IBAN', () => {
    const germanIban = 'DE89370400440532013000';
    const validationResult = validateIban(germanIban);
    expect(validationResult.isValid).toBe(true);
  });

  // Test case for a valid Austrian IBAN
  it('should correctly validate a valid Austrian IBAN', () => {
    const austrianIban = 'AT611904300234573201';
    const validationResult = validateIban(austrianIban);
    expect(validationResult.isValid).toBe(true);
  });

  // Test case for an invalid IBAN
  it('should correctly invalidate an incorrect IBAN', () => {
    const invalidIban = 'DE1234567890';
    const validationResult = validateIban(invalidIban);
    expect(validationResult.isValid).toBe(false);
  });
});
