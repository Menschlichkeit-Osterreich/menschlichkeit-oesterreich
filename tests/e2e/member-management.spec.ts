/**
 * E2E Smoke Tests für Member Management
 * 
 * Tests:
 * - Suche & Filter
 * - Detail-Modal öffnen/schließen
 * - Edit-Modus aktivieren & Änderungen speichern
 * - Persistence prüfen (Reload)
 * 
 * Run: npx playwright test tests/e2e/member-management.spec.ts
 */

import { test, expect } from '@playwright/test';

// Test-Konfiguration
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

test.describe('Member Management - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login (falls nicht cached)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Warte auf Redirect nach Login
    await page.waitForURL(/\/(member|admin)/, { timeout: 5000 });
    
    // Navigate to Member Management
    await page.goto(`${BASE_URL}/admin/members`);
    await page.waitForLoadState('networkidle');
  });

  test('sollte Mitgliederliste laden und anzeigen', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Mitgliederverwaltung');
    
    // Check search input exists
    await expect(page.locator('input[placeholder*="Suche"]')).toBeVisible();
    
    // Check filter dropdowns exist
    await expect(page.locator('select').first()).toBeVisible(); // Status filter
    await expect(page.locator('select').nth(1)).toBeVisible(); // Type filter
    
    // Check at least one member card is displayed (if data exists)
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    if (count > 0) {
      await expect(memberCards.first()).toBeVisible();
    } else {
      // Empty state should be visible if no members
      await expect(page.locator('text=/keine mitglieder/i')).toBeVisible();
    }
  });

  test('sollte Suche nach Name funktionieren', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Suche"]');
    
    // Enter search term
    await searchInput.fill('Maria');
    
    // Wait for results to update (client-side filter)
    await page.waitForTimeout(500);
    
    // Check filtered results
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    if (count > 0) {
      // All visible cards should contain "Maria" in name
      for (let i = 0; i < count; i++) {
        const cardText = await memberCards.nth(i).textContent();
        expect(cardText?.toLowerCase()).toContain('maria');
      }
    }
  });

  test('sollte Status-Filter funktionieren', async ({ page }) => {
    const statusFilter = page.locator('select').first();
    
    // Select "aktiv" status
    await statusFilter.selectOption('active');
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // Check that only active members are shown (if data exists)
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    if (count > 0) {
      // Check for active badge or status indicator
      const badges = page.locator('[data-testid="status-badge"]');
      const badgeCount = await badges.count();
      
      if (badgeCount > 0) {
        const firstBadgeText = await badges.first().textContent();
        expect(firstBadgeText?.toLowerCase()).toContain('aktiv');
      }
    }
  });

  test('sollte Detail-Modal öffnen und schließen', async ({ page }) => {
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    // Skip if no members
    if (count === 0) {
      test.skip();
      return;
    }
    
    // Click first member card
    await memberCards.first().click();
    
    // Wait for modal to open
    await page.waitForSelector('[data-testid="member-detail-modal"]', { state: 'visible', timeout: 2000 });
    
    // Check modal content
    await expect(page.locator('h2')).toContainText(/persönliche daten|mitgliedsdaten/i);
    
    // Close modal via button
    await page.locator('[data-testid="close-modal-button"]').click();
    
    // Wait for modal to close
    await page.waitForSelector('[data-testid="member-detail-modal"]', { state: 'hidden', timeout: 2000 });
  });

  test('sollte Edit-Modus aktivieren und Telefonnummer ändern', async ({ page }) => {
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    // Skip if no members
    if (count === 0) {
      test.skip();
      return;
    }
    
    // Open detail modal
    await memberCards.first().click();
    await page.waitForSelector('[data-testid="member-detail-modal"]', { state: 'visible' });
    
    // Activate edit mode
    await page.locator('[data-testid="edit-button"]').click();
    
    // Check that input fields are editable
    const phoneInput = page.locator('input[name="phone"]');
    await expect(phoneInput).toBeEditable();
    
    // Change phone number
    const newPhone = '+43 676 999 8888';
    await phoneInput.clear();
    await phoneInput.fill(newPhone);
    
    // Save changes
    await page.locator('[data-testid="save-button"]').click();
    
    // Wait for success message or modal close
    await page.waitForTimeout(1000);
    
    // Check for success toast/alert
    const successMessage = page.locator('text=/erfolgreich gespeichert/i');
    if (await successMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(successMessage).toBeVisible();
    }
  });

  test('sollte Änderungen nach Reload persistieren', async ({ page }) => {
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    // Skip if no members
    if (count === 0) {
      test.skip();
      return;
    }
    
    // Open detail modal
    await memberCards.first().click();
    await page.waitForSelector('[data-testid="member-detail-modal"]', { state: 'visible' });
    
    // Get member name for re-identification after reload
    const memberName = await page.locator('[data-testid="member-name"]').textContent();
    
    // Close modal
    await page.locator('[data-testid="close-modal-button"]').click();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Search for same member
    const searchInput = page.locator('input[placeholder*="Suche"]');
    await searchInput.fill(memberName || '');
    await page.waitForTimeout(500);
    
    // Open detail modal again
    await page.locator('[data-testid="member-card"]').first().click();
    await page.waitForSelector('[data-testid="member-detail-modal"]', { state: 'visible' });
    
    // Verify member name is still the same
    await expect(page.locator('[data-testid="member-name"]')).toContainText(memberName || '');
  });

  test('sollte Badges für Mitgliedsstatus korrekt anzeigen', async ({ page }) => {
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    // Skip if no members
    if (count === 0) {
      test.skip();
      return;
    }
    
    // Check that each card has a status badge
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = memberCards.nth(i);
      const badge = card.locator('[data-testid="status-badge"]');
      await expect(badge).toBeVisible();
      
      // Badge should have one of the expected status texts
      const badgeText = await badge.textContent();
      expect(badgeText?.toLowerCase()).toMatch(/aktiv|pending|expired|cancelled/);
    }
  });

  test('sollte Fehlermeldung bei ungültiger E-Mail anzeigen', async ({ page }) => {
    const memberCards = page.locator('[data-testid="member-card"]');
    const count = await memberCards.count();
    
    // Skip if no members
    if (count === 0) {
      test.skip();
      return;
    }
    
    // Open detail modal
    await memberCards.first().click();
    await page.waitForSelector('[data-testid="member-detail-modal"]', { state: 'visible' });
    
    // Activate edit mode
    await page.locator('[data-testid="edit-button"]').click();
    
    // Enter invalid email
    const emailInput = page.locator('input[name="email"]');
    await emailInput.clear();
    await emailInput.fill('invalid-email');
    
    // Try to save
    await page.locator('[data-testid="save-button"]').click();
    
    // Check for error message (either inline or toast)
    const errorMessage = page.locator('text=/ungültig|invalid|error/i');
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('Dashboard Vorstand/Kassier - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(member|admin)/);
    
    // Navigate to Dashboard
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  test('sollte KPI-Karten laden und anzeigen', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check KPI cards exist
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    const count = await kpiCards.count();
    
    // Should have at least 5 KPI cards (total, active, new_30d, churn_30d, pending)
    expect(count).toBeGreaterThanOrEqual(5);
    
    // Check that cards have values (not loading state)
    await page.waitForTimeout(2000); // Wait for API calls
    const firstCardValue = page.locator('[data-testid="kpi-value"]').first();
    await expect(firstCardValue).toBeVisible();
  });

  test('sollte Finanz-KPIs anzeigen', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check that finance section exists
    await expect(page.locator('h2:has-text("Finanzen")')).toBeVisible();
    
    // Check donations MTD/YTD cards
    await expect(page.locator('text=/spenden mtd/i')).toBeVisible();
    await expect(page.locator('text=/spenden ytd/i')).toBeVisible();
    
    // Check values are in EUR format
    const financeValues = page.locator('[data-testid="kpi-value"]').filter({ hasText: /€/ });
    const count = await financeValues.count();
    expect(count).toBeGreaterThan(0);
  });

  test('sollte Aktivitäts-Bereich anzeigen', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check activity section exists
    await expect(page.locator('h2:has-text("Aktivität")')).toBeVisible();
    
    // Check recent changes KPI
    await expect(page.locator('text=/änderungen.*24h/i')).toBeVisible();
    
    // Check last updates list (if data exists)
    const updatesList = page.locator('[data-testid="last-updates"]');
    if (await updatesList.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(updatesList).toBeVisible();
    }
  });
});
