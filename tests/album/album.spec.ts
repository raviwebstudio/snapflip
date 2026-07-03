import { test, expect } from '@playwright/test';

test.describe('Album Details Suit', () => {
  test('should load details creator screen', async ({ page }) => {
    await page.goto('/create');
    await expect(page.locator('text=Album Name')).toBeVisible();
  });
});
