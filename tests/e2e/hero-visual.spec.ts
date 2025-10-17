import { test, expect } from '@playwright/test';

const bps = [
  { w: 390, h: 844, name: 'xs' },
  { w: 768, h: 1024, name: 'md' },
  { w: 1280, h: 800, name: 'lg' },
];

test.describe('Hero – Design-Parität', () => {
  for (const bp of bps) {
    test(`snapshot @${bp.name}`, async ({ page }) => {
      const baseURL = process.env.APP_URL || 'http://localhost:5173';
      try {
        await page.setViewportSize({ width: bp.w, height: bp.h });
        await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
      } catch (e) {
        test.skip(true, `Frontend not reachable at ${baseURL}: ${String(e)}`);
        return;
      }
      const hero = page.locator('#hero-section');
      await expect(hero).toBeVisible();
      await expect(hero).toHaveScreenshot(`hero-${bp.name}.png`, { maxDiffPixelRatio: 0.01 });
    });
  }
});
