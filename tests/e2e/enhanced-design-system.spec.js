// Enhanced Design System E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Enhanced Design System Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page
    await page.goto('/games/enhanced-design-system-demo.html');

    // Wait for components to load
    await page.waitForSelector('.enhanced-game-button');
  });

  test('should display the hero section with title and buttons', async ({ page }) => {
    // Check hero title
    await expect(page.locator('h1')).toContainText('Enhanced Design System Demo');

    // Check hero description
    await expect(page.locator('.hero p')).toContainText('Educational Gaming Platform');

    // Check hero buttons are present
    await expect(page.locator('#hero-buttons .enhanced-game-button')).toHaveCount(2);
  });

  test('should show asset generation statistics', async ({ page }) => {
    // Check asset stats section
    await expect(page.locator('#asset-stats')).toBeVisible();

    // Should have dashboard cards for each asset family
    const dashboardCards = page.locator('#asset-stats .enhanced-dashboard-card');
    await expect(dashboardCards).toHaveCount(5);

    // Check specific asset families
    await expect(page.locator('text=Icons Values')).toBeVisible();
    await expect(page.locator('text=Map Regions')).toBeVisible();
    await expect(page.locator('text=Bridge Puzzle')).toBeVisible();
  });

  test('should display interactive button variants', async ({ page }) => {
    // Check button variants section
    const buttonVariants = page.locator('#button-variants .enhanced-game-button');
    await expect(buttonVariants).toHaveCount(5);

    // Test button click interaction
    const defaultButton = buttonVariants.first();
    await defaultButton.click();

    // Should show toast notification
    await expect(page.locator('.enhanced-game-alert')).toBeVisible();
  });

  test('should show achievement badges with different rarities', async ({ page }) => {
    // Check achievement badges
    const badges = page.locator('#achievement-badges .enhanced-achievement-badge');
    await expect(badges).toHaveCount(5);

    // Check different rarity classes
    await expect(page.locator('.rarity-bronze')).toBeVisible();
    await expect(page.locator('.rarity-silver')).toBeVisible();
    await expect(page.locator('.rarity-gold')).toBeVisible();
    await expect(page.locator('.rarity-platinum')).toBeVisible();
    await expect(page.locator('.rarity-legendary')).toBeVisible();
  });

  test('should display level progress cards with animations', async ({ page }) => {
    // Check level progress cards
    const progressCards = page.locator('#level-progress .enhanced-level-progress-card');
    await expect(progressCards).toHaveCount(2);

    // Check progress bars are present
    await expect(page.locator('.progress-bar')).toHaveCount(2);

    // Hover should trigger animation
    await progressCards.first().hover();
    await expect(progressCards.first()).toHaveCSS('transform', /translateY/);
  });

  test('should show player profiles with avatars', async ({ page }) => {
    // Check player profiles
    const profiles = page.locator('#player-profiles .enhanced-player-profile');
    await expect(profiles).toHaveCount(3);

    // Check avatars are loaded
    const avatars = page.locator('.profile-avatar img');
    await expect(avatars).toHaveCount(3);

    // Check profile names
    await expect(page.locator('text=Anna Müller')).toBeVisible();
    await expect(page.locator('text=Max Schmidt')).toBeVisible();
    await expect(page.locator('text=Prof. Weber')).toBeVisible();
  });

  test('should display interactive minigame cards', async ({ page }) => {
    // Check minigame cards
    const minigameCards = page.locator('#minigame-cards .enhanced-minigame-card');
    await expect(minigameCards).toHaveCount(4);

    // Check minigame titles
    await expect(page.locator('text=Wahlsystem Puzzle')).toBeVisible();
    await expect(page.locator('text=Meinungsfreiheit Arena')).toBeVisible();

    // Test play button interaction
    const playButton = page.locator('.minigame-play-button').first();
    await playButton.click();

    // Should show success alert
    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('should show teacher dashboard analytics', async ({ page }) => {
    // Check dashboard cards
    const dashboardCards = page.locator('#dashboard-cards .enhanced-dashboard-card');
    await expect(dashboardCards).toHaveCount(4);

    // Check specific metrics
    await expect(page.locator('text=Aktive Spieler')).toBeVisible();
    await expect(page.locator('text=176')).toBeVisible();
    await expect(page.locator('text=Abgeschlossene Spiele')).toBeVisible();
    await expect(page.locator('text=2.847')).toBeVisible();
  });

  test('should display different alert types', async ({ page }) => {
    // Check alert section
    const alerts = page.locator('#game-alerts .enhanced-game-alert');
    await expect(alerts).toHaveCount(4);

    // Check alert types
    await expect(page.locator('.alert-info')).toBeVisible();
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-warning')).toBeVisible();
    await expect(page.locator('.alert-error')).toBeVisible();

    // Test dismiss functionality
    const dismissButton = page.locator('.alert-dismiss').first();
    await dismissButton.click();

    // Alert should fade out
    await page.waitForTimeout(500); // Wait for animation
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that demo grid adapts to single column
    const grids = page.locator('.demo-grid.cols-2, .demo-grid.cols-3, .demo-grid.cols-4');

    for (const grid of await grids.all()) {
      await expect(grid).toHaveCSS('grid-template-columns', '1fr');
    }

    // Check that buttons stack vertically
    const buttonGroup = page.locator('.button-group').first();
    await expect(buttonGroup).toHaveCSS('flex-direction', 'column');
  });

  test('should load all generated assets', async ({ page }) => {
    // Check that SVG assets are accessible
    const assetPaths = [
      '/games/assets/generated/icons_values_equality.svg',
      '/games/assets/generated/characters_teacher.svg',
      '/games/assets/generated/ui_buttons_play.svg',
    ];

    for (const path of assetPaths) {
      const response = await page.request.get(path);
      expect(response.status()).toBe(200);
    }
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check aria labels
    const buttons = page.locator('.enhanced-game-button');
    for (const button of await buttons.all()) {
      await expect(button).toHaveAttribute('aria-label');
    }

    // Check role attributes
    const profiles = page.locator('.enhanced-player-profile');
    for (const profile of await profiles.all()) {
      await expect(profile).toHaveAttribute('role', 'region');
    }

    // Check alt text for images
    const images = page.locator('img');
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation through buttons
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveClass(/enhanced-game-button/);

    // Test Enter key on focused button
    await page.keyboard.press('Enter');

    // Should trigger button action
    await expect(page.locator('.enhanced-game-alert')).toBeVisible();
  });

  test('should perform well with many components', async ({ page }) => {
    // Measure performance
    const startTime = Date.now();

    // Wait for all components to be rendered
    await page.waitForSelector('#dashboard-cards .enhanced-dashboard-card');
    await page.waitForSelector('#achievement-badges .enhanced-achievement-badge');

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load reasonably fast (< 3 seconds)
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Asset Management System Integration', () => {
  test('should have generated all required assets', async ({ page }) => {
    // Check metadata summary endpoint
    const response = await page.request.get('/games/assets/metadata/batch_generation_summary.json');
    expect(response.status()).toBe(200);

    const summary = await response.json();

    // Verify all families are present
    expect(summary).toHaveProperty('icons_values');
    expect(summary).toHaveProperty('map_regions');
    expect(summary).toHaveProperty('minigames_bridge_puzzle');
    expect(summary).toHaveProperty('ui_buttons');
    expect(summary).toHaveProperty('characters');

    // Verify asset counts
    expect(summary.icons_values).toHaveLength(4);
    expect(summary.map_regions).toHaveLength(10);
    expect(summary.minigames_bridge_puzzle).toHaveLength(8);
    expect(summary.ui_buttons).toHaveLength(3);
    expect(summary.characters).toHaveLength(3);
  });

  test('should serve SVG assets correctly', async ({ page }) => {
    // Test various asset types
    const testAssets = [
      'icons_values_equality.svg',
      'characters_teacher.svg',
      'ui_buttons_play.svg',
      'map_regions_austria.svg',
      'minigames_bridge_puzzle_water.svg',
    ];

    for (const asset of testAssets) {
      const response = await page.request.get(`/games/assets/generated/${asset}`);
      expect(response.status()).toBe(200);

      const content = await response.text();
      expect(content).toContain('<svg');
      expect(content).toContain('</svg>');
    }
  });

  test('should have valid metadata for each asset', async ({ page }) => {
    // Test metadata files
    const testMetadata = [
      'icons_values_equality.json',
      'characters_teacher.json',
      'ui_buttons_play.json',
    ];

    for (const metaFile of testMetadata) {
      const response = await page.request.get(`/games/assets/metadata/${metaFile}`);
      expect(response.status()).toBe(200);

      const metadata = await response.json();

      // Verify required metadata fields
      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('alt_text');
      expect(metadata).toHaveProperty('tags');
      expect(metadata).toHaveProperty('file_info');
      expect(metadata).toHaveProperty('accessibility');
    }
  });
});
