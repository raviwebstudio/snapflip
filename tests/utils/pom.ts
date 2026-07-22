import { Page, Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly heroSection: Locator;
  readonly ctaButton: Locator;
  readonly trustedSection: Locator;
  readonly featuresSection: Locator;
  readonly processSection: Locator;
  readonly pricingSection: Locator;
  readonly faqSection: Locator;
  readonly footerSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('span:has-text("SnapFlip")').first();
    this.heroSection = page.locator('section:has-text("Transform your high-resolution photography portfolios")').first();
    this.ctaButton = page.locator('a:has-text("Get Started")').first();
    this.trustedSection = page.locator('p:has-text("Trusted by elite photographers")').first();
    this.featuresSection = page.locator('section:has-text("Designed for premium visual storytelling")').first();
    this.processSection = page.locator('section:has-text("Seamlessly build and publish")').first();
    this.pricingSection = page.locator('section:has-text("Choose your membership tier")').first();
    this.faqSection = page.locator('section:has-text("Frequently asked questions")').first();
    this.footerSection = page.locator('footer').first();
  }

  async navigate() {
    await this.page.goto('/');
  }

  async clickNavbarLink(name: string) {
    let link = this.page.locator(`nav a:has-text("${name}"):visible`).first();
    if (!(await link.isVisible())) {
      const hamburger = this.page.locator('nav button:has(svg)').first();
      await hamburger.click({ force: true });
      await this.page.waitForTimeout(300);
      link = this.page.locator(`nav a:has-text("${name}"):visible`).first();
    }
    await link.click();
  }
}

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly searchInput: Locator;
  readonly notificationsBtn: Locator;
  readonly createAlbumBtn: Locator;
  readonly albumsTab: Locator;
  readonly settingsTab: Locator;
  readonly pricingTab: Locator;
  readonly draftFilter: Locator;
  readonly publishedFilter: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('aside').first();
    this.searchInput = page.locator('input[placeholder*="Search"]').first();
    this.notificationsBtn = page.locator('button[title*="Notification"], button:has(.bell)').first();
    this.createAlbumBtn = page.locator('main a[href="/create"]:visible, div.hidden.md\\:block a[href="/create"]:visible, button:has-text("Create Album"):visible').first();
    this.albumsTab = page.locator('button:has-text("Albums"), a[href*="tab=albums"]').first();
    this.settingsTab = page.locator('a[href="/settings"]').first();
    this.pricingTab = page.locator('a[href="/pricing"]').first();
    this.draftFilter = page.locator('button:has-text("Draft")').first();
    this.publishedFilter = page.locator('button:has-text("Published")').first();
    this.sortSelect = page.locator('select').first();
  }

  async navigate(tab?: string) {
    const url = tab ? `/dashboard?tab=${tab}` : '/dashboard';
    await this.page.goto(url);
    if (tab === 'albums') {
      await this.page.locator('h4:has-text("Create New Album"), h4:has-text("No Collections Found")').first().waitFor({ state: 'visible', timeout: 15000 });
    } else {
      await this.page.waitForSelector('text=Overview', { state: 'attached' });
    }
  }

  async openCardMenu(albumName: string) {
    // Find the album card with this title and click the three dot button
    const card = this.page.locator(`div.group:has(h3:has-text("${albumName}")), div.group:has(h4:has-text("${albumName}"))`).first();
    await card.locator('button[title="Actions menu"], button:has(.lucide-more-vertical), button:has-text("•••")').first().click();
  }

  async clickCardMenuItem(itemText: string) {
    await this.page.locator(`.dropdown-menu button:has-text("${itemText}"), .dropdown-menu div:has-text("${itemText}")`).first().click();
  }
}

export class CreateAlbumWizard {
  readonly page: Page;
  readonly albumNameInput: Locator;
  readonly clientNameInput: Locator;
  readonly eventTypeSelect: Locator;
  readonly eventDateInput: Locator;
  readonly sizeSelect: Locator;
  readonly nextButton: Locator;
  readonly uploadArea: Locator;
  readonly publishBtn: Locator;
  readonly saveDraftBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.albumNameInput = page.locator('input[placeholder*="Wedding Collection"], input[placeholder*="Album Name"]').first();
    this.clientNameInput = page.locator('input[placeholder*="Sarah & Michael"], input[placeholder*="Client Name"]').first();
    this.eventTypeSelect = page.locator('select').first();
    this.eventDateInput = page.locator('input[type="date"]').first();
    this.sizeSelect = page.locator('select').nth(1);
    this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    this.uploadArea = page.locator('input[type="file"]').first();
    this.publishBtn = page.locator('button:has-text("Publish Album")').first();
    this.saveDraftBtn = page.locator('button:has-text("Save Draft")').first();
  }

  async fillDetails(opts: { name: string; client: string; category: string; size: string; date: string }) {
    await this.albumNameInput.fill(opts.name);
    await this.clientNameInput.fill(opts.client);
    await this.eventTypeSelect.selectOption(opts.category);
    await this.eventDateInput.fill(opts.date);
    await this.sizeSelect.selectOption(opts.size);
  }

  async uploadFiles(filePaths: string[]) {
    await this.uploadArea.setInputFiles(filePaths);
    await this.page.waitForTimeout(2500);
  }
}

export class ViewerPage {
  readonly page: Page;
  readonly passcodeField: Locator;
  readonly verifyPasscodeBtn: Locator;
  readonly nextBtn: Locator;
  readonly prevBtn: Locator;
  readonly musicBtn: Locator;
  readonly downloadBtn: Locator;
  readonly infoBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passcodeField = page.locator('input[type="password"]').first();
    this.verifyPasscodeBtn = page.locator('button:has-text("Verify Passcode")').first();
    this.nextBtn = page.locator('button[title*="Next"]').first();
    this.prevBtn = page.locator('button[title*="Prev"]').first();
    this.musicBtn = page.locator('button[title*="soundtrack"]').first();
    this.downloadBtn = page.locator('button[title*="Download"]').first();
    this.infoBtn = page.locator('button[title*="details"]').first();
  }

  async enterPasscode(code: string) {
    await this.passcodeField.fill(code);
    await this.verifyPasscodeBtn.click();
  }
}

export class SettingsPage {
  readonly page: Page;
  readonly studioNameInput: Locator;
  readonly notificationsToggle: Locator;
  readonly saveBtn: Locator;
  readonly resetBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.studioNameInput = page.locator('div:has(> label:has-text("Studio / Business Name")) > input').first();
    this.notificationsToggle = page.locator('div:has(h4:has-text("Email Alerts")) > button').first();
    this.saveBtn = page.locator('button:has-text("Save Changes")').first();
    this.resetBtn = page.locator('button:has-text("Reset Settings")').first();
  }
}
