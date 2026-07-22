import { test, expect } from '@playwright/test';
import { seedDatabase } from '../utils/helpers';
import { DashboardPage } from '../utils/pom';

test.describe('Update Published Album E2E Suite', () => {
  test.beforeAll(async () => {
    // Seed the database to ensure we have standard mock albums (Wedding Collection)
    await seedDatabase();
  });

  test('should edit and update an already published album', async ({ page }) => {
    // Set a generous timeout for this multi-step wizard transition E2E test
    test.setTimeout(90000);

    // 1. Navigate to dashboard albums tab
    const dashboard = new DashboardPage(page);
    await dashboard.navigate('albums');

    // 2. Open actions menu on the "Wedding Collection" card and click "Edit"
    const card = page.locator('div.group:has(h4:has-text("Wedding Collection"))').first();
    await expect(card).toBeVisible();
    
    const actionsMenuBtn = card.locator('button[title="Actions menu"]');
    await actionsMenuBtn.click();

    const editBtn = page.locator('button:has-text("Edit")');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // 3. Confirm transition to the album creator wizard in Edit Mode
    await expect(page).toHaveURL(/\/create\?id=/);
    await expect(page.locator('text=Edit Mode')).toBeVisible();

    // 4. Progress through the wizard steps
    // Step 1: Details
    await page.locator('button[type="submit"]:has-text("Next: Upload Photos")').click();

    // Step 2: Upload
    await expect(page.locator('text=Photo Upload')).toBeVisible();
    const nextToOrganize = page.locator('button:has-text("Next: Organize Album")');
    await expect(nextToOrganize).toBeEnabled({ timeout: 15000 });
    await nextToOrganize.click();

    // Step 3: Organize
    await expect(page.locator('text=Organize Photos')).toBeVisible();
    await page.locator('button:has-text("Next: Album Settings")').click();

    // Step 4: Settings
    await expect(page.locator('text=Theme Selection')).toBeVisible();
    await page.locator('button:has-text("Next: Review Summary")').click();

    // Step 5: Review
    await expect(page.locator('text=Review & Publish')).toBeVisible();
    
    // 5. Verify button text is "Update Published Album" since it's already published
    const updateBtn = page.locator('button:has-text("Update Published Album")');
    await expect(updateBtn).toBeVisible();

    // Click "Update Published Album"
    await updateBtn.click();

    // 6. Verify success modal confirmation appears
    const successTitle = page.locator('text=Album Updated!');
    await expect(successTitle.first()).toBeVisible({ timeout: 15000 });

    // 7. Verify redirection back to the dashboard tab=albums
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('text=Wedding Collection')).toBeVisible();
  });
});
