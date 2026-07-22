import { test, expect } from '@playwright/test';
import { seedDatabase } from '../utils/helpers';
import { DashboardPage } from '../utils/pom';

test.describe('Album Delete, Restore, and Permanent Delete E2E Suite', () => {
  test.beforeAll(async () => {
    await seedDatabase();
  });

  test('should soft delete, restore, and hard delete an album', async ({ page }) => {
    // Set a timeout of 90 seconds for this multi-step delete lifecycle E2E test
    test.setTimeout(90000);

    // Log browser console errors/logs
    page.on('console', (msg) => {
      console.log(`[Browser Console] [${msg.type()}] ${msg.text()}`);
    });

    // 1. Navigate to dashboard albums tab directly using POM
    const dashboard = new DashboardPage(page);
    await dashboard.navigate('albums');

    // Verify there are initially 5 albums in the active list (wait for load)
    const initialCards = page.locator('.grid > div');
    await expect(async () => {
      const count = await initialCards.count();
      expect(count).toBe(5);
    }).toPass({ timeout: 15000 });

    const initialCount = await initialCards.count();
    console.log(`Initial active albums: ${initialCount}`);

    // 3. Find "Wedding Collection" and click actions menu (three-dot button)
    // In our UI, the three dot button is inside the card
    const firstCard = page.locator('div.group:has(h4:has-text("Wedding Collection"))').first();
    const actionsMenuBtn = firstCard.locator('button[title="Actions menu"]');
    await actionsMenuBtn.click();

    // 4. Click "Delete Album" in the dropdown list
    const deleteOption = page.locator('button:has-text("Delete Album")');
    await expect(deleteOption).toBeVisible();
    await deleteOption.click();

    // 5. In the confirmation modal, click 'Delete'
    const modalConfirmBtn = page.locator('div:has(h3:has-text("Delete Album?")) button:has-text("Delete")').last();
    await expect(modalConfirmBtn).toBeVisible();
    await modalConfirmBtn.click();

    // 6. Verify success toast appears and album disappears from grid
    await expect(page.locator('text=Album moved to Trash').first()).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Now there should be 4 active albums (wait for UI)
    await expect(async () => {
      const count = await page.locator('.grid > div').count();
      expect(count).toBe(4);
    }).toPass({ timeout: 15000 });

    const softDeletedCount = await page.locator('.grid > div').count();
    console.log(`Active albums after soft delete: ${softDeletedCount}`);

    // 7. Click the 'Trash' tab
    const trashTab = page.locator('button:has-text("Trash")');
    await trashTab.click({ force: true });

    // 8. Verify the album is in the Trash (wait for load)
    await expect(async () => {
      await expect(page.locator('h4:has-text("Wedding Collection")')).toBeVisible();
    }).toPass({ timeout: 15000 });

    await expect(page.locator('text=14 days left')).toBeVisible();

    // 9. Click "Restore" on the album card
    const restoreBtn = page.locator('button:has-text("Restore")');
    await restoreBtn.click();

    // 10. Verify restore toast appears
    await expect(page.locator('text=Album collection restored successfully!')).toBeVisible();
    
    // 11. Go back to Albums tab and verify it's back to 5 (wait for UI)
    await dashboard.albumsTab.click({ force: true });
    await expect(async () => {
      const count = await page.locator('.grid > div').count();
      expect(count).toBe(5);
    }).toPass({ timeout: 15000 });

    const restoredCount = await page.locator('.grid > div').count();
    console.log(`Active albums after restore: ${restoredCount}`);

    // 12. Soft delete it again
    const firstCardAgain = page.locator('div.group:has(h4:has-text("Wedding Collection"))').first();
    await firstCardAgain.locator('button[title="Actions menu"]').click();
    await expect(page.locator('button:has-text("Delete Album")')).toBeVisible();
    await page.locator('button:has-text("Delete Album")').click();

    const confirmBtnAgain = page.locator('div:has(h3:has-text("Delete Album?")) button:has-text("Delete")').last();
    await expect(confirmBtnAgain).toBeVisible();
    await confirmBtnAgain.click();
    await expect(page.locator('text=Album moved to Trash').first()).toBeVisible();

    // 13. Go to Trash tab
    await trashTab.click({ force: true });
    await expect(async () => {
      await expect(page.locator('h4:has-text("Wedding Collection")')).toBeVisible();
    }).toPass({ timeout: 15000 });

    // 14. Click 'Delete Permanently'
    const deletePermanentlyBtn = page.locator('button:has-text("Delete Permanently")').first();
    await deletePermanentlyBtn.click();

    // 15. In the confirmation modal, click 'Delete Permanently'
    const modalDeletePermanentlyBtn = page.locator('button:has-text("Delete Permanently")').last();
    await modalDeletePermanentlyBtn.click();

    // Verify success toast appears
    await expect(page.locator('text=Album deleted permanently.').first()).toBeVisible();

    // 16. Verify the Trash tab is now empty and shows "Trash is empty" (wait for UI)
    await expect(async () => {
      await expect(page.locator('text=Trash is empty')).toBeVisible();
    }).toPass({ timeout: 15000 });

    // 17. Verify it is gone from Albums tab permanently (wait for UI)
    await dashboard.albumsTab.click({ force: true });
    await expect(async () => {
      const count = await page.locator('.grid > div').count();
      expect(count).toBe(4);
    }).toPass({ timeout: 15000 });

    const finalCount = await page.locator('.grid > div').count();
    console.log(`Final active albums: ${finalCount}`);
  });
});
