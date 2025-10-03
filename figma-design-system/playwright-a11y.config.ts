import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/accessibility',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/accessibility-html' }],
    ['json', { outputFile: 'test-results/accessibility-results.json' }],
    ['junit', { outputFile: 'test-results/accessibility-junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium-a11y',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-a11y',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-a11y',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome-a11y',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari-a11y',
      use: { ...devices['iPhone 12'] },
    }
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});