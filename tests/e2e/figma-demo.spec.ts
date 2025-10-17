import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';

async function canReach(page: any, url: string) {
  try {
    const res = await page.request.get(url);
    return res.ok();
  } catch {
    return false;
  }
}

test.describe('Figma Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    const ok = await canReach(page, baseUrl);
    test.skip(!ok, `Dev server not reachable at ${baseUrl}`);
  });

  test('loads and renders sections', async ({ page }) => {
    await page.goto(`${baseUrl}/figma-demo`);
    await expect(page.getByTestId('figma-demo')).toBeVisible();
  });

  for (const vp of [
    { width: 375, height: 812, name: 'xs' },
    { width: 768, height: 1024, name: 'md' },
    { width: 1280, height: 800, name: 'lg' },
  ]) {
    test(`visual snapshot (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseUrl}/figma-demo`);
      const shot = await page.screenshot({ fullPage: true });
      await expect(shot).toMatchSnapshot(`figma-demo-${vp.name}.png`, { maxDiffPixels: 500 });
    });
  }
});
