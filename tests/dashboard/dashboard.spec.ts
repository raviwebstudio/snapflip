import { test, expect } from '@playwright/test';
import { DashboardPage } from '../utils/pom';

test.describe('Dashboard Page E2E Suite', () => {
  test('should load workspace components correctly', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();

    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768;

    // Verify main workspace layout elements
    if (isDesktop) {
      await expect(dashboard.sidebar).toBeVisible();
    }
    await expect(dashboard.createAlbumBtn).toBeVisible();
    await expect(dashboard.albumsTab).toBeVisible();
    await expect(dashboard.settingsTab).toBeVisible();
    await expect(dashboard.pricingTab).toBeVisible();

    // Verify dynamic statistics cards
    await expect(page.locator('text=Total Albums')).toBeVisible();
    await expect(page.locator('text=Total Photos')).toBeVisible();
    await expect(page.locator('text=Storage Used')).toBeVisible();
  });

  test('should support searching and tab filtering', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();

    // Switch to Albums tab
    await dashboard.albumsTab.click();

    const isDesktopOrTablet = (page.viewportSize()?.width ?? 1280) >= 640;

    // Type query into search bar if visible (on desktop/tablet)
    if (isDesktopOrTablet) {
      await expect(dashboard.searchInput).toBeVisible();
      await dashboard.searchInput.fill('NonExistentAlbumSearchQuery');
      await expect(page.locator('text=No Collections Found')).toBeVisible();
      // Clear search
      await dashboard.searchInput.fill('');
    }

    // Click Draft filter tab
    await dashboard.draftFilter.click();
    await expect(dashboard.draftFilter).toHaveClass(/text-sky-400/);

    // Click Published filter tab
    await dashboard.publishedFilter.click();
    await expect(dashboard.publishedFilter).toHaveClass(/text-sky-400/);
  });
});
