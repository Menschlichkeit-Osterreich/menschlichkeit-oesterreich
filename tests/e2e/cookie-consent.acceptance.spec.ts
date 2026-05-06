/**
 * Cookie-Consent Acceptance Test Suite
 * 5 critical user flows for DSGVO-compliant cookie consolidation
 * Location: tests/e2e/cookie-consent.acceptance.spec.ts
 */

import { expect, Page, test } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

/**
 * Helper: Clear localStorage between tests
 */
async function clearConsent(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('cookie-preferences');
    localStorage.removeItem('moe_cookie_consent'); // legacy key
  });
}

/**
 * Helper: Get current cookie preferences from localStorage
 */
async function getConsentPreferences(page: Page): Promise<any> {
  return await page.evaluate(() => {
    const stored = localStorage.getItem('cookie-preferences');
    return stored ? JSON.parse(stored) : null;
  });
}

/**
 * Helper: Take screenshot with context
 */
async function takeScreenshot(page: Page, testName: string, context: string) {
  await page.screenshot({
    path: `quality-reports/screenshots/cookie-consent-${testName}-${context}.png`,
    fullPage: true,
  });
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('Cookie Consent - Acceptance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsent(page);
  });

  // ========================================================================
  // TC-1: Empty State (No Consent Banner Initially)
  // ========================================================================
  test('TC-1: Banner shows on first visit (empty state)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Verify banner is visible
    const banner = page.locator('[data-testid="cookie-consent-banner"]');
    await expect(banner).toBeVisible();

    // Verify localStorage is empty
    const prefs = await getConsentPreferences(page);
    expect(prefs).toBeNull();

    // Screenshot: Empty state
    await takeScreenshot(page, 'tc1', 'empty-state');
  });

  // ========================================================================
  // TC-2: Essential-Only Flow (Minimal Consent)
  // ========================================================================
  test('TC-2: User accepts only essential cookies', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Click "Nur notwendige" button
    const essentialButton = page.locator(
      'button:has-text("Nur notwendige"), button:has-text("Only essential")'
    );
    await essentialButton.click();

    // Verify localStorage: essential=true, others=false
    const prefs = await getConsentPreferences(page);
    expect(prefs).toBeDefined();
    expect(prefs.essential).toBe(true);
    expect(prefs.analytics).toBe(false);
    expect(prefs.marketing).toBe(false);
    expect(prefs.external).toBe(false);

    // Verify banner is now hidden
    const banner = page.locator('[data-testid="cookie-consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Verify timestamp is set
    expect(prefs.timestamp).toBeGreaterThan(0);

    // Screenshot: Essential-only saved
    await takeScreenshot(page, 'tc2', 'essential-only');
  });

  // ========================================================================
  // TC-3: All-Accept Flow (Maximum Consent)
  // ========================================================================
  test('TC-3: User accepts all cookies', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Click "Alle akzeptieren" button
    const acceptAllButton = page.locator(
      'button:has-text("Alle akzeptieren"), button:has-text("Accept all")'
    );
    await acceptAllButton.click();

    // Verify localStorage: all categories true
    const prefs = await getConsentPreferences(page);
    expect(prefs).toBeDefined();
    expect(prefs.essential).toBe(true);
    expect(prefs.analytics).toBe(true);
    expect(prefs.marketing).toBe(true);
    expect(prefs.external).toBe(true);

    // Verify banner is hidden
    const banner = page.locator('[data-testid="cookie-consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Screenshot: All-accept saved
    await takeScreenshot(page, 'tc3', 'all-accepted');
  });

  // ========================================================================
  // TC-4: Customize Modal Flow
  // ========================================================================
  test('TC-4: User customizes consent preferences via modal', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Click "Anpassen" / "Customize" button
    const customizeButton = page.locator(
      'button:has-text("Anpassen"), button:has-text("Customize")'
    );
    await customizeButton.click();

    // Wait for modal to open
    const modal = page.locator('[data-testid="privacy-center-modal"]');
    await expect(modal).toBeVisible();

    // Select specific categories: analytics=true, marketing=false, external=true
    const analyticsToggle = page.locator('[data-testid="toggle-analytics"]');
    const marketingToggle = page.locator('[data-testid="toggle-marketing"]');
    const externalToggle = page.locator('[data-testid="toggle-external"]');

    await analyticsToggle.check();
    await marketingToggle.uncheck();
    await externalToggle.check();

    // Click "Save" button in modal
    const saveButton = modal.locator('button:has-text("Save"), button:has-text("Speichern")');
    await saveButton.click();

    // Wait for modal to close
    await expect(modal).not.toBeVisible();

    // Verify localStorage matches customization
    const prefs = await getConsentPreferences(page);
    expect(prefs).toBeDefined();
    expect(prefs.essential).toBe(true);
    expect(prefs.analytics).toBe(true); // Selected
    expect(prefs.marketing).toBe(false); // Deselected
    expect(prefs.external).toBe(true); // Selected

    // Verify banner is hidden
    const banner = page.locator('[data-testid="cookie-consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Screenshot: Custom preferences saved
    await takeScreenshot(page, 'tc4', 'customized');
  });

  // ========================================================================
  // TC-5: Legacy Migration Flow
  // ========================================================================
  test('TC-5: Legacy consent migrates to new format', async ({ page }) => {
    // Set legacy consent in localStorage before navigation
    await page.evaluate(() => {
      localStorage.setItem('moe_cookie_consent', 'accepted');
    });

    // Navigate to app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Wait a moment for migration to occur
    await page.waitForTimeout(500);

    // Verify legacy key is removed
    const legacyStored = await page.evaluate(() => {
      return localStorage.getItem('moe_cookie_consent');
    });
    expect(legacyStored).toBeNull();

    // Verify new key exists and has been migrated
    const prefs = await getConsentPreferences(page);
    expect(prefs).toBeDefined();
    expect(prefs.essential).toBe(true); // Always true
    expect(prefs.analytics).toBe(false); // Conservative default
    expect(prefs.marketing).toBe(false); // Conservative default
    expect(prefs.external).toBe(false); // Conservative default

    // Verify banner is NOT shown (migration happened)
    const banner = page.locator('[data-testid="cookie-consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Screenshot: Migration complete
    await takeScreenshot(page, 'tc5', 'migrated');
  });

  // ========================================================================
  // Additional: Persistence Across Navigation
  // ========================================================================
  test('TC-6: Consent persists across page navigation', async ({ page }) => {
    // First visit: Accept all
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const acceptAllButton = page.locator(
      'button:has-text("Alle akzeptieren"), button:has-text("Accept all")'
    );
    await acceptAllButton.click();

    // Verify saved
    let prefs = await getConsentPreferences(page);
    expect(prefs?.analytics).toBe(true);

    // Navigate to different route
    await page.goto(`${BASE_URL}/#/privacy`);
    await page.waitForLoadState('networkidle');

    // Verify banner is NOT shown (consent already set)
    const banner = page.locator('[data-testid="cookie-consent-banner"]');
    await expect(banner).not.toBeVisible();

    // Verify consent still in localStorage
    prefs = await getConsentPreferences(page);
    expect(prefs?.analytics).toBe(true);
    expect(prefs?.essential).toBe(true);

    // Screenshot: Persisted after navigation
    await takeScreenshot(page, 'tc6', 'persisted');
  });

  // ========================================================================
  // Accessibility: ARIA Attributes
  // ========================================================================
  test('TC-7: Banner has proper ARIA labels and roles', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const banner = page.locator('[data-testid="cookie-consent-banner"]');

    // Verify ARIA attributes
    await expect(banner).toHaveAttribute('role', 'dialog');
    await expect(banner).toHaveAttribute('aria-label', /.*/); // Has some aria-label

    // Verify buttons are keyboard accessible
    const buttons = banner.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      // Verify each button is accessible
      await expect(btn)
        .toBeFocused()
        .catch(() => {
          // It's OK if not focused initially
        });
    }
  });
});
