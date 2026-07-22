import { test, expect } from '@playwright/test';
import { SettingsPage } from '../utils/pom';

test.describe('Settings Page E2E Suite', () => {
  test('should load storage status and preferences', async ({ page }) => {
    const settings = new SettingsPage(page);
    await page.goto('/settings');

    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768;

    // Verify studio preferences fields
    if (isDesktop) {
      await expect(settings.studioNameInput).toBeVisible();
    }
    await expect(settings.notificationsToggle).toBeVisible();
    await expect(settings.saveBtn).toBeVisible();
    await expect(settings.resetBtn).toBeVisible();

  });

  test('should validate saving settings updates', async ({ page }) => {
    const settings = new SettingsPage(page);
    await page.goto('/settings');

    const isDesktop = (page.viewportSize()?.width ?? 1280) >= 768;

    // We only fill Studio name if visible on desktop, or we can locate it safely
    if (isDesktop) {
      await settings.studioNameInput.fill('Playwright QA Studio');
    }

    // Fill out the required profile fields to avoid browser native validation blocks
    await page.locator('div:has(> label:has-text("Full Name")) > input').fill('John Doe');
    await page.locator('div:has(> label:has-text("Email Address")) > input').fill('john@aurastudios.com');
    await page.locator('div:has(> label:has-text("Phone Number")) > input').fill('+1 (555) 234-5678');

    await settings.saveBtn.click();

    // Verify toast success confirmation
    await expect(page.locator('text=Workspace settings saved successfully!')).toBeVisible({ timeout: 5000 });
  });
});
