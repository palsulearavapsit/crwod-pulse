import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/CrowdPulse/i);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should login as test attendee', async ({ page }) => {
    await page.goto('/login');
    
    // Use the new industrial-grade form fields
    await page.fill('input[placeholder="Username"]', 'arav');
    await page.fill('input[placeholder="Password"]', 'arav');
    await page.click('button:has-text("Access System")');
    
    // After login, should land on attendee dashboard
    await expect(page).toHaveURL(/\/attendee/);
    await expect(page.locator('h1')).toContainText('CrowdPulse');
  });
});
