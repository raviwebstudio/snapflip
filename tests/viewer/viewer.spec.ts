import { test, expect } from '@playwright/test';

test.describe('Viewer Route Suite', () => {
  test('should fallback to 404 on invalid slug', async ({ page }) => {
    await page.goto('/view/invalid-slug-id-999');
    await expect(page.locator('text=Album Not Found')).toBeVisible();
  });
});
