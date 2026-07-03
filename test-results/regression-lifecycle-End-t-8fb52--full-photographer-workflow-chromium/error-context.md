# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression\lifecycle.spec.ts >> End-to-End Album Lifecycle Suite (QA-E2E-001) >> should execute the full photographer workflow
- Location: tests\regression\lifecycle.spec.ts:18:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=No collections found')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=No collections found')

```

```yaml
- complementary:
  - link "Snap Flip":
    - /url: /
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "Create Album":
      - /url: /create
    - link "Analytics":
      - /url: /analytics
    - link "Pricing":
      - /url: /pricing
    - link "Settings":
      - /url: /settings
  - link "JD John Doe john@aurastudios.com":
    - /url: /settings
    - text: JD
    - paragraph: John Doe
    - paragraph: john@aurastudios.com
- banner:
  - heading "Dashboard" [level=2]
  - textbox "Search albums..."
  - button
- main:
  - button "Overview"
  - button "Albums"
  - text: Workspace Active
  - heading "Welcome back, John!" [level=1]
  - paragraph: Your photography portfolios are looking great. You have 4 active digital flipbooks running. Update your galleries, track live view counts, or share secure client links below.
  - link "Create Album":
    - /url: /create
  - text: Total Albums 4 Total Photos 240 Total Views 3,115 Storage Used 768.0 MB
  - heading "Storage Status" [level=4]
  - paragraph: Includes raw photo uploads and generated digital flipbook files.
  - text: "768.0 MB used of 100 GB limit Usage: 0.75% Workspace Plan"
  - heading "Recent Workspace Activity" [level=4]
  - paragraph: Timeline of updates across your collections and links.
  - heading "Album Shared & Published" [level=5]
  - text: Just now
  - paragraph: Showcase live for Wedding Collection (82 photos)
  - heading "Album Shared & Published" [level=5]
  - text: 2 hours ago
  - paragraph: Showcase live for Pre Wedding (48 photos)
  - heading "Album Edited / Created" [level=5]
  - text: 4 days ago
  - paragraph: "Staged progress for Reception Details (Client: Maya & Rohan)"
  - heading "Album Shared & Published" [level=5]
  - text: 6 days ago
  - paragraph: Showcase live for Portfolio Collection (45 photos)
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { createMockImages, cleanupMockImages } from '../utils/helpers';
  3   | import { LandingPage, DashboardPage, CreateAlbumWizard, ViewerPage } from '../utils/pom';
  4   | 
  5   | test.describe('End-to-End Album Lifecycle Suite (QA-E2E-001)', () => {
  6   |   let mockFilePaths: string[] = [];
  7   | 
  8   |   test.beforeAll(() => {
  9   |     // Generate 20 mock images for the upload step
  10  |     mockFilePaths = createMockImages(20);
  11  |   });
  12  | 
  13  |   test.afterAll(() => {
  14  |     // Clean up temporary files
  15  |     cleanupMockImages();
  16  |   });
  17  | 
  18  |   test('should execute the full photographer workflow', async ({ page }) => {
  19  |     // Collect console errors
  20  |     const consoleErrors: string[] = [];
  21  |     page.on('pageerror', (err) => consoleErrors.push(err.message));
  22  |     page.on('console', (msg) => {
  23  |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  24  |     });
  25  | 
  26  |     // --------------------------------------------------
  27  |     // STEP 1 — Open Application & Verify Landing Loads
  28  |     // --------------------------------------------------
  29  |     const landing = new LandingPage(page);
  30  |     await landing.navigate();
  31  |     await expect(page).toHaveTitle(/snapflip/i);
  32  |     expect(consoleErrors.length).toBe(0);
  33  | 
  34  |     // Clear local storage for a clean slate
  35  |     await page.evaluate(() => localStorage.clear());
  36  |     await page.reload();
  37  | 
  38  |     // --------------------------------------------------
  39  |     // STEP 2 — Dashboard Navigation
  40  |     // --------------------------------------------------
  41  |     const dashboard = new DashboardPage(page);
  42  |     await dashboard.navigate();
  43  |     await expect(dashboard.sidebar).toBeVisible();
  44  |     await expect(dashboard.createAlbumBtn).toBeVisible();
  45  | 
  46  |     // Verify initial empty state
> 47  |     await expect(page.locator('text=No collections found')).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  48  | 
  49  |     // --------------------------------------------------
  50  |     // STEP 3 — Create Album Details
  51  |     // --------------------------------------------------
  52  |     await dashboard.createAlbumBtn.click();
  53  |     await expect(page).toHaveURL(/\/create/);
  54  | 
  55  |     const wizard = new CreateAlbumWizard(page);
  56  |     await wizard.fillDetails({
  57  |       name: 'QA Automation Album',
  58  |       client: 'Playwright Test User',
  59  |       category: 'Wedding',
  60  |       size: 'auto',
  61  |       date: '2026-07-04'
  62  |     });
  63  | 
  64  |     // Continue to Step 2: Upload
  65  |     await page.locator('button[type="submit"]:has-text("Next: Upload Photos")').click();
  66  | 
  67  |     // --------------------------------------------------
  68  |     // STEP 4 — Upload Images
  69  |     // --------------------------------------------------
  70  |     await expect(page.locator('text=Upload Photos')).toBeVisible();
  71  |     await wizard.uploadFiles(mockFilePaths);
  72  | 
  73  |     // Wait until upload completes (Next button gets enabled)
  74  |     const nextToOrganize = page.locator('button:has-text("Next: Organize Album")');
  75  |     await expect(nextToOrganize).toBeEnabled({ timeout: 15500 });
  76  |     await nextToOrganize.click();
  77  | 
  78  |     // --------------------------------------------------
  79  |     // STEP 5 — Organizer Actions
  80  |     // --------------------------------------------------
  81  |     await expect(page.locator('text=Organize Gallery')).toBeVisible();
  82  | 
  83  |     // Verify all 20 previews render
  84  |     const itemCards = page.locator('div[draggable="true"]');
  85  |     await expect(itemCards).toHaveCount(20);
  86  | 
  87  |     // Rotate the first image
  88  |     const firstCard = itemCards.first();
  89  |     const rotateRightBtn = firstCard.locator('button[title*="Rotate Right"]');
  90  |     await rotateRightBtn.click();
  91  | 
  92  |     // Delete one image (reducing count to 19)
  93  |     const deleteBtn = firstCard.locator('button[title*="Delete image"]');
  94  |     await deleteBtn.click();
  95  | 
  96  |     // Confirm deletion inside the modal
  97  |     const modalDeleteBtn = page.locator('button:has-text("Delete")');
  98  |     await modalDeleteBtn.click();
  99  |     await expect(itemCards).toHaveCount(19);
  100 | 
  101 |     // Drag & Drop reorder
  102 |     const secondCard = itemCards.nth(1);
  103 |     await secondCard.dragTo(firstCard);
  104 | 
  105 |     // Set first image as cover
  106 |     const coverBtn = itemCards.first().locator('button[title*="Set as album cover"]');
  107 |     if (await coverBtn.isEnabled()) {
  108 |       await coverBtn.click();
  109 |     }
  110 | 
  111 |     // Continue to Step 4: Settings
  112 |     await page.locator('button:has-text("Next: Album Settings")').click();
  113 | 
  114 |     // --------------------------------------------------
  115 |     // STEP 6 — Settings Step
  116 |     // --------------------------------------------------
  117 |     await expect(page.locator('text=Theme Selection')).toBeVisible();
  118 | 
  119 |     // Change background music track
  120 |     await page.locator('div:has(label:has-text("Background Music")) select').selectOption('acoustic-guitar');
  121 | 
  122 |     // Click Apply Brand Watermark toggle button
  123 |     const watermarkToggleBtn = page.locator('div:has(h4:has-text("Apply Brand Watermark")) + button');
  124 |     await watermarkToggleBtn.click();
  125 | 
  126 |     // Continue to Step 5: Review
  127 |     await page.locator('button:has-text("Next: Review Summary")').click();
  128 | 
  129 |     // --------------------------------------------------
  130 |     // STEP 7 — Review & Publish
  131 |     // --------------------------------------------------
  132 |     await expect(page.locator('text=Review & Publish')).toBeVisible();
  133 |     await expect(page.locator('text=19 items')).toBeVisible(); // 20 uploaded, 1 deleted
  134 | 
  135 |     // Click Publish Album
  136 |     await page.locator('button:has-text("Publish Album")').click();
  137 | 
  138 |     // Wait for success popup and redirect
  139 |     await expect(page.locator('text=Album Published!').first()).toBeVisible({ timeout: 6000 });
  140 |     await page.waitForURL(/\/dashboard/);
  141 | 
  142 |     // --------------------------------------------------
  143 |     // STEP 8 — Dashboard Verification
  144 |     // --------------------------------------------------
  145 |     // Switch to albums tab
  146 |     await dashboard.albumsTab.click();
  147 |     await expect(page.locator('text=QA Automation Album')).toBeVisible();
```