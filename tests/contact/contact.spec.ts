import { test, expect } from '@playwright/test';

test.describe('Contact Page E2E Suite', () => {
  test('should validate input errors and successful submission', async ({ page }) => {
    await page.goto('/contact');

    // 1. Submit empty form and catch native browser alert()
    const submitBtn = page.locator('button[type="submit"]');
    
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Please fill in Name, Email, and Message fields');
      await dialog.accept();
    });
    
    await submitBtn.click();

    // 2. Fill valid data
    await page.locator('input[placeholder*="John Doe"]').fill('Playwright Tester');
    await page.locator('input[placeholder*="john@yourstudio.com"]').fill('qa@snapflip.pro');
    await page.locator('textarea[placeholder*="Describe your studio"]').fill('This is an automated Playwright E2E form test message.');

    // 3. Submit valid form
    await submitBtn.click();

    // 4. Verify success confirmation toast
    await expect(page.locator('text=Message Sent Successfully!')).toBeVisible({ timeout: 5000 });
  });
});
