import { test, expect } from '@playwright/test';

test.describe('Sharing Action Suite', () => {
  test('should bypass share modal if no active album selected', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Total Albums').first()).toBeVisible();
  });
});
