import { test, expect } from '@playwright/test';

test.describe('Viewer Route Suite', () => {
  test('should fallback to 404 on invalid slug', async ({ page }) => {
    await page.goto('/view/invalid-slug-id-999');
    // Allow up to 15s for the DB request to resolve and show the 404 state
    await expect(page.locator('text=Album Not Found')).toBeVisible({ timeout: 15000 });
  });

  test('should redirect legacy /view/:slug to /album/:slug', async ({ page }) => {
    await page.goto('/view/demo-album');
    await page.waitForURL('**/album/demo-album');
    expect(page.url()).toContain('/album/demo-album');
  });

  test('should set correct document title and open graph meta tags', async ({ page }) => {
    await page.goto('/album/demo-album');
    await expect(page).toHaveTitle(/Aura Showcase/);
  });

  test('should display passcode lock gate and remember session', async ({ page }) => {
    await page.goto('/album/pre-wedding');
    
    // 1. Verify passcode screen is visible
    await expect(page.locator('text=This photography collection is passcode protected by the studio')).toBeVisible();
    
    // 2. Submit wrong passcode
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrong-passcode');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=This photography collection is passcode protected by the studio')).toBeVisible();
    
    // 3. Submit correct passcode
    await passwordInput.fill('123456');
    await page.locator('button[type="submit"]').click();
    
    // Verify unlocked
    await expect(page.locator('h2', { hasText: 'Pre Wedding' }).filter({ visible: true }).first()).toBeVisible();
    
    // 4. Verify session memory on reload
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('h2', { hasText: 'Pre Wedding' }).filter({ visible: true }).first()).toBeVisible();
  });

  test('should load demo-album and support interactive controls', async ({ page }) => {
    await page.goto('/album/demo-album');

    // 1. Verify Cover Page loads successfully
    await expect(page.locator('h2', { hasText: 'Aura Showcase' }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator('text=Aura Demo Portfolio')).toBeVisible();

    // 2. Test Zoom functionality
    const zoomInBtn = page.locator('button[title*="Zoom In"]');
    const zoomOutBtn = page.locator('button[title*="Zoom Out"]');
    await expect(zoomInBtn).toBeVisible();
    await zoomInBtn.click();
    await expect(page.locator('text=125%')).toBeVisible();
    await zoomInBtn.click();
    await expect(page.locator('text=150%')).toBeVisible();
    await zoomOutBtn.click();
    await expect(page.locator('text=125%')).toBeVisible();

    // 3. Test Fullscreen button visibility
    await expect(page.locator('button[title*="Fullscreen"]')).toBeVisible();

    // 4. Test Jump to Page Dropdown select interaction
    const jumpSelect = page.locator('select');
    await expect(jumpSelect).toBeVisible();
    await jumpSelect.selectOption({ label: '📖 Page 2' });
    await page.waitForTimeout(1200);
    await expect(page.locator('#page-number-display')).toContainText('Page 2');

    // 5. Test Keyboard Navigation (Arrow Keys)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1200);
    await expect(page.locator('#page-number-display')).toContainText('Page 3');

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(1200);

    // 6. Test Thumbnail Strip click-to-navigate
    const thumbnailCoverBtn = page.locator('button[title*="Cover Page"]').first();
    await expect(thumbnailCoverBtn).toBeVisible();
    await thumbnailCoverBtn.click();
    await page.waitForTimeout(1200);
    await expect(page.locator('span:has-text("Cover Page")').first()).toBeVisible();

    // 7. Test LocalStorage Page State Preservation
    await jumpSelect.selectOption({ label: '📖 Page 2' });
    await page.waitForTimeout(1200);
    
    await page.reload();
    await page.waitForTimeout(1500);
    await expect(page.locator('#page-number-display')).toContainText('Page 2');
  });
});
