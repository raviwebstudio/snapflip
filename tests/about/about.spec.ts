import { test, expect } from '@playwright/test';

test.describe('About Page E2E Suite', () => {
  test('should load timeline and studio information cards', async ({ page }) => {
    await page.goto('/about');

    // Verify company values / mission statements are present
    await expect(page.locator('text=Elevating digital storytelling for creators')).toBeVisible();
    await expect(page.locator('text=Our Story')).toBeVisible();

    // Verify grid cards
    await expect(page.locator('text=Why SnapFlip')).toBeVisible();
    await expect(page.locator('text=Tactile Fidelity')).toBeVisible();
  });
});
