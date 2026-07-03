import { test, expect } from '@playwright/test';

test.describe('Pricing Page E2E Suite', () => {
  test('should load tiers and navigate correctly', async ({ page }) => {
    await page.goto('/pricing');

    // Verify pricing tiers are visible
    await expect(page.locator('text=Starter Hobby')).toBeVisible();
    await expect(page.locator('text=Professional Photographer')).toBeVisible();
    await expect(page.locator('text=Premium Studio')).toBeVisible();

    // Verify billing period description
    await expect(page.locator('text=Subscription Plans')).toBeVisible();
  });
});
