import { test, expect } from '@playwright/test';
import { LandingPage } from '../utils/pom';

test.describe('Landing Page E2E Suite', () => {
  test('should load landing page sections successfully', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.navigate();

    // Check basic brand components
    await expect(page).toHaveTitle(/snapflip/i);
    await expect(landing.logo).toBeVisible();

    // Check key landing page sections
    await expect(landing.heroSection).toBeVisible();
    await expect(landing.ctaButton).toBeVisible();
    await expect(landing.trustedSection).toBeVisible();
    await expect(landing.featuresSection).toBeVisible();
    await expect(landing.processSection).toBeVisible();
    await expect(landing.pricingSection).toBeVisible();
    await expect(landing.faqSection).toBeVisible();
    await expect(landing.footerSection).toBeVisible();
  });

  test('should navigate via navbar links', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.navigate();

    // Navigate to About page
    await landing.clickNavbarLink('About');
    await expect(page).toHaveURL(/\/about/);

    // Navigate back and go to Contact page
    await page.goto('/');
    await landing.clickNavbarLink('Contact');
    await expect(page).toHaveURL(/\/contact/);

    // Navigate to Dashboard
    await page.goto('/');
    await landing.clickNavbarLink('Dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
