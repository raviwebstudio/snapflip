import { test, expect } from '@playwright/test';

test.describe('Auth Test Suite', () => {
  test('should bypass auth and load landing directly', async ({ page }) => {
    await page.goto('/');
    // Brand logo is visible on both desktop and mobile viewports
    await expect(page.locator('span:has-text("SnapFlip")').first()).toBeVisible();
  });
});
