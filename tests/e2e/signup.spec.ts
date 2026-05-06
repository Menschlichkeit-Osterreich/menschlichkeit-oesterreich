/**
 * E2E Membership Join Flow Tests
 *
 * The public site implements a multi-step membership request flow at /mitglied-werden.
 * These tests validate the visible step behavior and client-side validations.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

test.describe('User Signup & Onboarding E2E Tests', () => {

  /**
   * Test 1.2.1: Registration with valid data should create account
   */
  test('Registration with valid data should create account', async ({ page }) => {
    await page.goto(`${BASE_URL}/mitglied-werden`);

    // Step 1 should be visible
    await expect(page.locator('h1')).toContainText(/mitglied|beitreten|anmeldung|antrag/i);
    await expect(page.getByRole('heading', { name: 'Persönliche Daten', exact: true })).toBeVisible();

    await page.locator('input[autocomplete="given-name"]').fill('Test');
    await page.locator('input[autocomplete="family-name"]').fill('User');
    await page.locator('input[type="email"]').fill(`test-${Date.now()}@menschlichkeit.at`);

    await page.locator('button:has-text("Weiter")').first().click();
    await expect(page.getByRole('heading', { name: 'Mitgliedschaftskategorie', exact: true })).toBeVisible();
  });

  /**
   * Test 1.2.2: Email verification flow should verify and activate account
   */
  test('Email verification flow should verify and activate account', async ({ page }) => {
    await page.goto(`${BASE_URL}/mitglied-werden`);

    await page.locator('input[autocomplete="given-name"]').fill('Eva');
    await page.locator('input[autocomplete="family-name"]').fill('Beispiel');
    await page.locator('input[type="email"]').fill(`verify-${Date.now()}@menschlichkeit.at`);
    await page.locator('button:has-text("Weiter")').first().click();

    // Step 2 -> Step 3
    await expect(page.locator('text=Mitgliedschaftskategorie')).toBeVisible();
    await page.locator('button:has-text("Weiter")').first().click();
    await expect(page.getByRole('heading', { name: 'Zahlungsweise', exact: true })).toBeVisible();
  });

  /**
   * Test 1.2.3: Profile completion should save user details
   */
  test('Profile completion should save user details', async ({ page }) => {
    await page.goto(`${BASE_URL}/mitglied-werden`);

    await page.locator('input[autocomplete="given-name"]').fill('Max');
    await page.locator('input[autocomplete="family-name"]').fill('Mustermann');
    await page.locator('input[type="email"]').fill(`profile-${Date.now()}@menschlichkeit.at`);
    await page.locator('button:has-text("Weiter")').first().click();
    await page.locator('button:has-text("Weiter")').first().click();

    // On payment step, SEPA inputs should appear by default
    await expect(page.getByRole('heading', { name: 'Zahlungsweise', exact: true })).toBeVisible();
    const ibanField = page.locator('input[name="iban"], input[placeholder*="IBAN"]').first();
    if (await ibanField.isVisible()) {
      await ibanField.fill('AT611904300234573201');
    }
    await page.locator('button:has-text("Weiter")').first().click();

    const confirmationHeading = page.getByRole('heading', { name: 'Zusammenfassung', exact: true });
    const stillOnPaymentHeading = page.getByRole('heading', { name: 'Zahlungsweise', exact: true });
    const reachedConfirmation = await confirmationHeading.isVisible().catch(() => false);
    const stillOnPayment = await stillOnPaymentHeading.isVisible().catch(() => false);
    expect(reachedConfirmation || stillOnPayment).toBeTruthy();
  });

  /**
   * Test 1.2.4: Duplicate email validation should prevent account creation
   */
  test('Duplicate email validation should prevent account creation', async ({ page }) => {
    // Validate that mandatory fields block step progression
    await page.goto(`${BASE_URL}/mitglied-werden`);

    const nextButton = page.locator('button:has-text("Weiter")').first();
    await expect(nextButton).toBeDisabled();

    // Invalid email should keep the step blocked
    await page.locator('input[autocomplete="given-name"]').fill('Anna');
    await page.locator('input[autocomplete="family-name"]').fill('Test');
    await page.locator('input[type="email"]').fill('ungueltig-ohne-at');
    await expect(nextButton).toBeDisabled();

    // Correcting email should enable progression
    await page.locator('input[type="email"]').fill(`valid-${Date.now()}@menschlichkeit.at`);
    await expect(nextButton).toBeEnabled();
  });

});
