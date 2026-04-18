import { test, expect } from '@playwright/test';

test.describe('Visual & Logic Check', () => {
  test('Dashboard matches visual snapshot', async ({ page }) => {
    await page.goto('/attendee');
    // Point 15: Visual regression check
    await expect(page).toHaveScreenshot('attendee-dashboard.png', {
      mask: [page.locator('.clock-dynamic')], // mask things that change every second
    });
  });

  test('i18n switching works correctly', async ({ page }) => {
    await page.goto('/attendee');
    await page.click('button:has-text("EN")');
    await expect(page.locator('h1')).toContainText('क्राउडपल्स'); // "CrowdPulse" in Hindi
  });
});
