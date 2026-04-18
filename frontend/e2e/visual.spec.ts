import { test, expect } from '@playwright/test';

test.describe('Visual & Logic Check', () => {
  test('Dashboard matches visual snapshot', async ({ page }) => {
    await page.goto('/attendee');
    // Verify dashboard core elements are visible
    await expect(page.locator('h1')).toContainText('CrowdPulse');
    await expect(page.locator('.glass-panel-light')).toBeVisible();
  });

  test('i18n switching works correctly', async ({ page }) => {
    await page.goto('/attendee');
    await page.waitForLoadState('networkidle');
    
    // Toggle from EN to HI
    await page.getByRole('button', { name: /EN/i }).click();
    await expect(page.locator('h1')).toContainText('क्राउडपल्स'); // "CrowdPulse" in Hindi
  });
});
