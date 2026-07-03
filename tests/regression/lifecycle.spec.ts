import { test, expect } from '@playwright/test';
import { createMockImages, cleanupMockImages } from '../utils/helpers';
import { LandingPage, DashboardPage, CreateAlbumWizard, ViewerPage } from '../utils/pom';

test.describe('End-to-End Album Lifecycle Suite (QA-E2E-001)', () => {
  let mockFilePaths: string[] = [];

  test.beforeAll(() => {
    // Generate 20 mock images for the upload step
    mockFilePaths = createMockImages(20);
  });

  test.afterAll(() => {
    // Clean up temporary files
    cleanupMockImages();
  });

  test('should execute the full photographer workflow', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // --------------------------------------------------
    // STEP 1 — Open Application & Verify Landing Loads
    // --------------------------------------------------
    const landing = new LandingPage(page);
    await landing.navigate();
    await expect(page).toHaveTitle(/snapflip/i);
    expect(consoleErrors.length).toBe(0);

    // Clear local storage for a clean slate
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // --------------------------------------------------
    // STEP 2 — Dashboard Navigation
    // --------------------------------------------------
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await expect(dashboard.sidebar).toBeVisible();
    await expect(dashboard.createAlbumBtn).toBeVisible();

    // Verify initial empty state
    await expect(page.locator('text=No collections found')).toBeVisible();

    // --------------------------------------------------
    // STEP 3 — Create Album Details
    // --------------------------------------------------
    await dashboard.createAlbumBtn.click();
    await expect(page).toHaveURL(/\/create/);

    const wizard = new CreateAlbumWizard(page);
    await wizard.fillDetails({
      name: 'QA Automation Album',
      client: 'Playwright Test User',
      category: 'Wedding',
      size: 'auto',
      date: '2026-07-04'
    });

    // Continue to Step 2: Upload
    await page.locator('button[type="submit"]:has-text("Next: Upload Photos")').click();

    // --------------------------------------------------
    // STEP 4 — Upload Images
    // --------------------------------------------------
    await expect(page.locator('text=Upload Photos')).toBeVisible();
    await wizard.uploadFiles(mockFilePaths);

    // Wait until upload completes (Next button gets enabled)
    const nextToOrganize = page.locator('button:has-text("Next: Organize Album")');
    await expect(nextToOrganize).toBeEnabled({ timeout: 15500 });
    await nextToOrganize.click();

    // --------------------------------------------------
    // STEP 5 — Organizer Actions
    // --------------------------------------------------
    await expect(page.locator('text=Organize Gallery')).toBeVisible();

    // Verify all 20 previews render
    const itemCards = page.locator('div[draggable="true"]');
    await expect(itemCards).toHaveCount(20);

    // Rotate the first image
    const firstCard = itemCards.first();
    const rotateRightBtn = firstCard.locator('button[title*="Rotate Right"]');
    await rotateRightBtn.click();

    // Delete one image (reducing count to 19)
    const deleteBtn = firstCard.locator('button[title*="Delete image"]');
    await deleteBtn.click();

    // Confirm deletion inside the modal
    const modalDeleteBtn = page.locator('button:has-text("Delete")');
    await modalDeleteBtn.click();
    await expect(itemCards).toHaveCount(19);

    // Drag & Drop reorder
    const secondCard = itemCards.nth(1);
    await secondCard.dragTo(firstCard);

    // Set first image as cover
    const coverBtn = itemCards.first().locator('button[title*="Set as album cover"]');
    if (await coverBtn.isEnabled()) {
      await coverBtn.click();
    }

    // Continue to Step 4: Settings
    await page.locator('button:has-text("Next: Album Settings")').click();

    // --------------------------------------------------
    // STEP 6 — Settings Step
    // --------------------------------------------------
    await expect(page.locator('text=Theme Selection')).toBeVisible();

    // Change background music track
    await page.locator('div:has(label:has-text("Background Music")) select').selectOption('acoustic-guitar');

    // Click Apply Brand Watermark toggle button
    const watermarkToggleBtn = page.locator('div:has(h4:has-text("Apply Brand Watermark")) + button');
    await watermarkToggleBtn.click();

    // Continue to Step 5: Review
    await page.locator('button:has-text("Next: Review Summary")').click();

    // --------------------------------------------------
    // STEP 7 — Review & Publish
    // --------------------------------------------------
    await expect(page.locator('text=Review & Publish')).toBeVisible();
    await expect(page.locator('text=19 items')).toBeVisible(); // 20 uploaded, 1 deleted

    // Click Publish Album
    await page.locator('button:has-text("Publish Album")').click();

    // Wait for success popup and redirect
    await expect(page.locator('text=Album Published!').first()).toBeVisible({ timeout: 6000 });
    await page.waitForURL(/\/dashboard/);

    // --------------------------------------------------
    // STEP 8 — Dashboard Verification
    // --------------------------------------------------
    // Switch to albums tab
    await dashboard.albumsTab.click();
    await expect(page.locator('text=QA Automation Album')).toBeVisible();
    await expect(page.locator('text=Clients: Playwright Test User')).toBeVisible();
    await expect(page.locator('text=19 photos')).toBeVisible();
    await expect(page.locator('span:has-text("Published")')).toBeVisible();

    // --------------------------------------------------
    // STEP 9 — Sharing
    // --------------------------------------------------
    // Open action menu on the card
    await dashboard.openCardMenu('QA Automation Album');
    await dashboard.clickCardMenuItem('Share');

    // Verify Share Modal tabs
    await expect(page.locator('text=Share Link')).toBeVisible();
    await expect(page.locator('text=Printable QR Card')).toBeVisible();

    // Copy Share Link
    const shareUrl = await page.locator('input[readonly]').first().inputValue();
    expect(shareUrl).toContain('/view/');

    // Click Close modal button (using the ESC button in header)
    await page.locator('button:has-text("ESC")').first().click();

    // --------------------------------------------------
    // STEP 10 — Album Viewer E2E Testing
    // --------------------------------------------------
    await page.goto(shareUrl);
    const viewer = new ViewerPage(page);

    // Verify cover page loads
    await expect(page.locator('text=QA Automation Album')).toBeVisible();
    await expect(page.locator('text=Playwright Test User')).toBeVisible();

    // Flip next
    await viewer.nextBtn.click();
    await page.waitForTimeout(1200);
    await expect(page.locator('text=Page 1').first()).toBeVisible();

    // Flip previous
    await viewer.prevBtn.click();
    await page.waitForTimeout(1200);
    await expect(page.locator('text=Cover Page')).toBeVisible();

    // Keyboard arrow navigation test
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1200);
    await expect(page.locator('text=Page 1').first()).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(1200);
    await expect(page.locator('text=Cover Page')).toBeVisible();

    // Information popup toggle
    await viewer.infoBtn.click();
    await expect(page.locator('text=Client: Playwright Test User')).toBeVisible();
    await viewer.infoBtn.click(); // Close details

    // Music Soundtrack playback toggle
    await viewer.musicBtn.click();
    await expect(page.locator('text=Playing background soundtrack')).toBeVisible();

    // --------------------------------------------------
    // STEP 11 — Delete Album
    // --------------------------------------------------
    await dashboard.navigate();
    await dashboard.albumsTab.click();
    await dashboard.openCardMenu('QA Automation Album');
    await dashboard.clickCardMenuItem('Delete Album');

    // Confirm deletion in modal
    await page.locator('button:has-text("Delete Album")').click();

    // Verify album removed from list
    await expect(page.locator('text=QA Automation Album')).not.toBeVisible();

    // --------------------------------------------------
    // STEP 12 — Negative Testing (404 / Not Found)
    // --------------------------------------------------
    await page.goto(shareUrl);
    await expect(page.locator('text=Album Not Found')).toBeVisible();

    // Verify final console logs
    console.log('[E2E Report Summary]');
    console.log('- Album Created: YES');
    console.log('- Images Uploaded: 20');
    console.log('- Image Deleted: 1');
    console.log('- Album Published: YES');
    console.log('- Viewer Verified: YES');
    console.log('- Album Deleted: YES');
    console.log('Status: PASS');
  });
});
