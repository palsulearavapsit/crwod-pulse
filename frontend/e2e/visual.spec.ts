import { test, expect } from '@playwright/test';

test.describe('Visual & Logic Check', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock session to bypass ProtectedRoute redirect
    await page.goto('/login'); // Need to be on the domain to set storage
    await page.evaluate(() => {
      localStorage.setItem('userRole', 'attendee');
      localStorage.setItem('cp_sessionExpiry', (Date.now() + 3600000).toString());
    });
  });

  test('Dashboard elements are visible', async ({ page }) => {
    await page.goto('/attendee');
    await page.waitForLoadState('networkidle');
    
    // Verify dashboard core elements are visible
    await expect(page.locator('h1')).toContainText('CrowdPulse');
    await expect(page.locator('.glass-panel')).toBeVisible();
  });

  test('i18n switching works correctly', async ({ page }) => {
    await page.goto('/attendee');
    await page.waitForLoadState('networkidle');
    
    // Toggle from EN to HI
    const langBtn = page.getByRole('button', { name: /EN|HI/i });
    await expect(langBtn).toBeVisible();
    await langBtn.click();
    
    // Check for "Venue Intelligence" in Hindi or similar marker
    // In our i18n/config, "Venue Intelligence" -> "स्थल इंटेलिजेंस"
    await expect(page).toHaveText(/इंटेलिजेंस/); 
  });
});
