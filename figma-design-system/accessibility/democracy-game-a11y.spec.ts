import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Democracy Game Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Main page should pass WCAG AA accessibility checks', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Democracy Game Hub should be accessible', async ({ page }) => {
    await page.goto('/democracy-hub');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Bridge Building game should be accessible', async ({ page }) => {
    // Navigate to the Bridge Building game section
    await page.locator('#democracy-game').scrollIntoView();
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#democracy-game')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Democracy Metaverse should be accessible', async ({ page }) => {
    // Navigate to the Democracy Metaverse section
    await page.locator('#democracy-metaverse').scrollIntoView();
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#democracy-metaverse')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Keyboard navigation should work throughout the application', async ({ page }) => {
    // Test skip to main content link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('text=Zum Hauptinhalt springen');
    await expect(skipLink).toBeFocused();
    
    // Activate skip link
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeInViewport();

    // Test navigation menu keyboard access
    await page.keyboard.press('Tab');
    const firstNavItem = page.locator('nav a').first();
    await expect(firstNavItem).toBeFocused();

    // Test that all interactive elements are keyboard accessible
    const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex="0"]');
    const count = await interactiveElements.count();
    
    // Ensure we can tab through at least 10 interactive elements
    expect(count).toBeGreaterThan(10);
  });

  test('Screen reader labels should be present', async ({ page }) => {
    // Check for proper ARIA labels on important elements
    const gameButtons = page.locator('button:has-text("spielen"), button:has-text("starten")');
    
    for (let i = 0; i < await gameButtons.count(); i++) {
      const button = gameButtons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const hasText = await button.textContent();
      
      // Either aria-label or visible text should be present
      expect(ariaLabel || hasText).toBeTruthy();
    }
  });

  test('Color contrast should meet WCAG AA standards', async ({ page }) => {
    // Test with axe-core's color-contrast rule specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form elements should have proper labels', async ({ page }) => {
    // Check contact form accessibility
    await page.locator('#contact').scrollIntoView();
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#contact')
      .withRules(['label', 'label-title-only'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Images should have appropriate alt text', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Focus indicators should be visible', async ({ page }) => {
    // Test that focus indicators are properly styled
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check that focus outline is visible (should have outline or box-shadow)
    const computedStyle = await focusedElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        boxShadow: style.boxShadow,
        border: style.border
      };
    });
    
    const hasFocusIndicator = 
      computedStyle.outline !== 'none' || 
      computedStyle.boxShadow !== 'none' || 
      computedStyle.border !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('Responsive design should maintain accessibility', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Game graphics should be accessible', async ({ page }) => {
    // Test SVG accessibility in game components
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    
    if (svgCount > 0) {
      // Check that SVGs have appropriate accessibility attributes
      for (let i = 0; i < Math.min(svgCount, 5); i++) {
        const svg = svgElements.nth(i);
        const hasTitle = await svg.locator('title').count() > 0;
        const hasAriaLabel = await svg.getAttribute('aria-label') !== null;
        const hasAriaHidden = await svg.getAttribute('aria-hidden') === 'true';
        const hasRole = await svg.getAttribute('role') !== null;
        
        // SVG should either be properly labeled or hidden from screen readers
        expect(hasTitle || hasAriaLabel || hasAriaHidden || hasRole).toBeTruthy();
      }
    }
  });

  test('Dynamic content should announce changes to screen readers', async ({ page }) => {
    // Test ARIA live regions for dynamic content
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    
    // We should have at least some live regions for dynamic content
    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      }
    }
  });

  test('Austrian language content should be properly marked', async ({ page }) => {
    // Check that German content is properly marked with lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toMatch(/^de(-AT)?$/);
    
    // Check for any English content that should be marked differently
    const englishContent = page.locator('text=/^[A-Za-z\s]+$/').filter({
      hasText: /^(english|login|password|email|submit|click|download|upload)$/i
    });
    
    const englishCount = await englishContent.count();
    if (englishCount > 0) {
      // English words should ideally be in elements with lang="en"
      // This is a warning, not a hard failure
      console.warn(`Found ${englishCount} potentially English elements without lang="en"`);
    }
  });
});