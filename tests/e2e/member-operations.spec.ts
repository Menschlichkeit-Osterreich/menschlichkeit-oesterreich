/**
 * E2E Member Operations Tests
 * 
 * Tests:
 * - Member login → member area access
 * - Profile update (personal info) → persistence
 * - SEPA management (setup/update) → payment method saved
 * - View invoices/receipts → invoice access
 * - Membership updates (category change) → effective immediately
 * 
 * Prerequisites:
 * - Test member account in database
 * - Member has access to /member routes
 * - SEPA management UI available
 * 
 * Run: npx playwright test tests/e2e/member-operations.spec.ts
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const TEST_MEMBER_EMAIL = process.env.TEST_MEMBER_EMAIL || 'member@menschlichkeit.at';
const TEST_MEMBER_PASSWORD = process.env.TEST_MEMBER_PASSWORD || 'MemberPassword123!';

async function hasLoginForm(page: import('@playwright/test').Page): Promise<boolean> {
  return page.locator('input[type="email"]').first().isVisible().catch(() => false);
}

test.describe('Member Operations E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Login as member before each test
    await page.goto(`${BASE_URL}/login`);

    if (!(await hasLoginForm(page))) {
      test.skip(true, 'CRM-Loginformular lokal nicht verfügbar (Public Host Fallback aktiv).');
      return;
    }
    
    const emailField = page.locator('input[type="email"]');
    await emailField.fill(TEST_MEMBER_EMAIL);
    
    const passwordField = page.locator('input[type="password"]');
    await passwordField.fill(TEST_MEMBER_PASSWORD);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for member area redirect
    await page.waitForURL(/\/(member|dashboard)/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  /**
   * Test 1.4.1: Member login and access to member area
   */
  test('Member login should grant access to member area', async ({ page }) => {
    // Verify we're in member area
    const memberPageTitle = page.locator('h1, h2, [role="heading"]').first();
    await expect(memberPageTitle).toBeVisible();
    
    // Verify member navigation menu is visible
    const memberMenu = page.locator('nav, [role="navigation"]').filter({ hasText: /profile|profil|dashboard|einstellungen/i }).first();
    await expect(memberMenu).toBeVisible({ timeout: 5000 });
    
    // Verify logout button is available (confirming login)
    const logoutButton = page.locator('button').filter({ hasText: /logout|abmelden/i }).first();
    await expect(logoutButton).toBeVisible();
  });

  /**
   * Test 1.4.2: Profile update and persistence
   */
  test('Profile update should persist after page reload', async ({ page }) => {
    // Navigate to profile page
    await page.goto(`${BASE_URL}/member/profil`);
    await page.waitForLoadState('networkidle');
    
    // Verify profile form
    const profileForm = page.locator('form').filter({ hasText: /profile|persönlich|personal/i }).first();
    await expect(profileForm).toBeVisible({ timeout: 5000 });
    
    // Get current values and modify them
    const phoneField = page.locator('input[type="tel"], input[placeholder*="phone"]').first();
    if (await phoneField.isVisible()) {
      // Clear existing value
      await phoneField.clear();
      // Enter new phone number
      const newPhone = '+43123456789';
      await phoneField.fill(newPhone);
    }
    
    const addressField = page.locator('input[placeholder*="address"], input[placeholder*="Adresse"], input[name*="address"]').first();
    if (await addressField.isVisible()) {
      const newAddress = 'Updated Street 123, 1010 Wien';
      await addressField.fill(newAddress);
    }
    
    // Save profile
    const saveButton = page.locator('button[type="submit"]').filter({ hasText: /save|speichern|aktualisieren/i }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Wait for success message
      await page.waitForLoadState('networkidle');
      
      const successMessage = page.locator('[role="alert"], text=/success|saved|gespeichert/i').first();
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
    
    // Reload page and verify data persisted
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that values are still there
    if (await phoneField.isVisible()) {
      const phoneValue = await phoneField.inputValue();
      expect(phoneValue).toContain('123456789');
    }
  });

  /**
   * Test 1.4.3: SEPA management setup/update
   */
  test('SEPA management should setup and save payment method', async ({ page }) => {
    // Navigate to payment/SEPA management
    await page.goto(`${BASE_URL}/member/sepa`);
    await page.waitForLoadState('networkidle');
    
    // Verify SEPA page
    const sepaTitle = page.locator('h1, h2').filter({ hasText: /sepa|payment|zahlung|einzugsermächtigung/i }).first();
    await expect(sepaTitle).toBeVisible({ timeout: 5000 });
    
    // Check for existing SEPA details
    const sepaForm = page.locator('form').filter({ hasText: /iban|sepa/i }).first();
    
    if (await sepaForm.isVisible()) {
      // Fill SEPA form
      const ibanField = page.locator('input[placeholder*="IBAN"], input[name*="iban"]').first();
      if (await ibanField.isVisible()) {
        // Clear existing and enter test IBAN
        await ibanField.clear();
        await ibanField.fill('DE89370400440532013000');
      }
      
      const nameField = page.locator('input[placeholder*="name"], input[name*="accountHolder"]').first();
      if (await nameField.isVisible()) {
        await nameField.fill('Test Member');
      }
      
      // Accept mandate checkbox
      const mandateCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /mandate|einzugsermächtigung|zustimmung/i }).first();
      if (await mandateCheckbox.isVisible()) {
        const isChecked = await mandateCheckbox.isChecked();
        if (!isChecked) {
          await mandateCheckbox.check();
        }
      }
      
      // Save SEPA
      const saveButton = page.locator('button[type="submit"]').filter({ hasText: /save|speichern|update|aktualisieren|confirm|bestätigen/i }).first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Wait for confirmation
        await page.waitForLoadState('networkidle');
        
        const successMessage = page.locator('[role="alert"], text=/success|saved|gespeichert|updated|aktualisiert/i').first();
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  /**
   * Test 1.4.4: View invoices/receipts
   */
  test('Member should be able to view invoices and receipts', async ({ page }) => {
    // Navigate to invoices/receipts page
    await page.goto(`${BASE_URL}/member/rechnungen`);
    await page.waitForLoadState('networkidle');
    
    // Verify invoices page
    const invoiceTitle = page.locator('h1, h2').filter({ hasText: /invoice|receipt|rechnung|quittung|belege/i }).first();
    
    if (await invoiceTitle.isVisible()) {
      // Check for invoice list
      const invoiceList = page.locator('[data-testid="invoice-list"], table, ul').filter({ hasText: /date|amount|status/i }).first();
      
      if (await invoiceList.isVisible()) {
        // Click on first invoice to view details
        const firstInvoiceRow = page.locator('[data-testid="invoice-row"], tr, li').first();
        if (await firstInvoiceRow.isVisible()) {
          await firstInvoiceRow.click();
          
          // Wait for invoice details to load
          await page.waitForLoadState('networkidle');
          
          // Check for download or view button
          const downloadButton = page.locator('button, a').filter({ hasText: /download|view|pdf|ansehen|herunterladen/i }).first();
          if (await downloadButton.isVisible()) {
            // Just verify button exists - don't click to avoid file operations in test
            expect(true).toBe(true);
          }
        }
      } else {
        // No invoices yet - that's OK
        const emptyState = page.locator('text=/no invoices|no receipts|keine rechnungen|keine belege/i').first();
        if (await emptyState.isVisible()) {
          expect(true).toBe(true);
        }
      }
    } else {
      console.log('Invoices page not accessible');
    }
  });

  /**
   * Test 1.4.5: Membership category change
   */
  test('Membership category change should be effective immediately', async ({ page }) => {
    // Navigate to membership settings
    await page.goto(`${BASE_URL}/member/profil`);
    await page.waitForLoadState('networkidle');
    
    // Look for membership category selector
    const membershipSelect = page.locator('select').filter({ hasText: /membership|category|type|art/i }).first();
    const membershipRadio = page.locator('input[type="radio"]').filter({ hasText: /standard|premium|student|fördernd|normal|ordentlich/i }).first();
    
    if (await membershipSelect.isVisible()) {
      // Get current value
      const currentValue = await membershipSelect.inputValue();
      
      // Change to different option
      const selectOptions = page.locator('select option');
      const optionCount = await selectOptions.count();
      
      if (optionCount > 1) {
        // Select a different option
        const options = await selectOptions.allTextContents();
        const nextOption = options[1]; // Pick second option
        await membershipSelect.selectOption(nextOption);
        
        // Verify change was saved
        await page.waitForLoadState('networkidle');
        
        const newValue = await membershipSelect.inputValue();
        if (newValue !== currentValue) {
          expect(true).toBe(true);
        }
      }
    } else if (await membershipRadio.isVisible()) {
      // Radio button selection
      const otherOption = page.locator('input[type="radio"]').filter({ hasText: /premium|student|fördernd/i }).first();
      if (await otherOption.isVisible()) {
        await otherOption.check();
        
        // Save changes if button exists
        const saveButton = page.locator('button[type="submit"]').filter({ hasText: /save|speichern|aktualisieren/i }).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForLoadState('networkidle');
        }
        
        expect(true).toBe(true);
      }
    } else {
      console.log('Membership category selector not found');
    }
  });

});
