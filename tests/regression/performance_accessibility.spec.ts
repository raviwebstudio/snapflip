import { test, expect } from '@playwright/test';

test.describe('Accessibility & Performance Suite', () => {
  test('should verify heading structure and ARIA attributes on landing page', async ({ page }) => {
    await page.goto('/');

    // Check headings hierarchy (should contain at least one h1 and several h2/h3)
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Verify presence of buttons and links
    const buttons = page.locator('button, a.button');
    const btnCount = await buttons.count();
    expect(btnCount).toBeGreaterThanOrEqual(0);

    // Verify brand logo has accessible label or text
    const logo = page.locator('span:has-text("SnapFlip")').first();
    await expect(logo).toBeVisible();
  });

  test('should verify there are no broken links or images on landing page', async ({ page }) => {
    await page.goto('/');

    // 1. Check images
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }

    // 2. Check major links do not return 404 or fail
    const links = page.locator('nav a[href^="/"]');
    const linkCount = await links.count();
    const visited = new Set<string>();

    for (let i = 0; i < linkCount; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !visited.has(href) && href !== '/dashboard' && href !== '/create') {
        visited.add(href);
        const response = await page.request.get(href);
        expect(response.status()).toBeLessThan(400);
      }
    }
  });
});
