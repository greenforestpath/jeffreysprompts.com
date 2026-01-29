/**
 * PricingPage Page Object
 *
 * Encapsulates interactions with the pricing/premium page:
 * - Plan comparison
 * - Feature lists
 * - CTA buttons
 * - FAQ section
 */

import { type Page, type Locator, type TestInfo } from "@playwright/test";
import { BasePage } from "./BasePage";
import { type ConsoleMonitor } from "../utils/console-monitor";

export interface PlanInfo {
  name: string;
  price: string | null;
  features: string[];
  isPopular: boolean;
  ctaText: string | null;
}

export class PricingPage extends BasePage {
  static readonly PATH = "/pricing";

  // --- Header Locators ---
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;

  // --- Plan Cards ---
  readonly planCards: Locator;
  readonly freePlanCard: Locator;
  readonly proPlanCard: Locator;
  readonly popularBadge: Locator;

  // --- CTA Buttons ---
  readonly ctaButtons: Locator;
  readonly getStartedButton: Locator;
  readonly upgradeToPro: Locator;

  // --- Feature Lists ---
  readonly featureLists: Locator;

  // --- FAQ Section ---
  readonly faqSection: Locator;
  readonly faqItems: Locator;

  // --- Billing Toggle ---
  readonly billingToggle: Locator;
  readonly monthlyOption: Locator;
  readonly yearlyOption: Locator;

  constructor(page: Page, testInfo?: TestInfo, sharedConsoleMonitor?: ConsoleMonitor) {
    super(page, testInfo, sharedConsoleMonitor);

    // Header
    this.pageTitle = page.getByRole("heading", { level: 1 });
    this.pageSubtitle = page.locator(".subtitle, [data-testid='pricing-subtitle']");

    // Plan cards
    this.planCards = page.locator("[data-testid='plan-card'], .plan-card, .pricing-card");
    this.freePlanCard = page.locator("[data-testid='free-plan'], :has-text('Free')").first();
    this.proPlanCard = page.locator("[data-testid='pro-plan'], :has-text('Pro')").first();
    this.popularBadge = page.getByText(/popular|recommended/i);

    // CTAs
    this.ctaButtons = page.locator("button, a").filter({ hasText: /get started|upgrade|subscribe|sign up/i });
    this.getStartedButton = page.getByRole("button", { name: /get started/i }).or(
      page.getByRole("link", { name: /get started/i })
    );
    this.upgradeToPro = page.getByRole("button", { name: /upgrade.*pro|go pro/i }).or(
      page.getByRole("link", { name: /upgrade.*pro|go pro/i })
    );

    // Features
    this.featureLists = page.locator("ul, [data-testid='feature-list']");

    // FAQ
    this.faqSection = page.locator("[data-testid='faq'], section:has-text('FAQ'), section:has-text('Questions')");
    this.faqItems = this.faqSection.locator("details, [data-testid='faq-item']");

    // Billing toggle
    this.billingToggle = page.locator("[data-testid='billing-toggle'], [role='tablist']");
    this.monthlyOption = page.getByRole("button", { name: /monthly/i }).or(page.getByText(/monthly/i).first());
    this.yearlyOption = page.getByRole("button", { name: /yearly|annual/i }).or(page.getByText(/yearly|annual/i).first());
  }

  // --- Navigation ---

  async goto() {
    await super.goto(PricingPage.PATH, { waitUntil: "networkidle" });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(timeout = 10000) {
    await this.assertVisible(this.pageTitle, { timeout });
    await this.waitForSpinnersToDisappear();
  }

  // --- Plan Information ---

  async getPlanCount(): Promise<number> {
    return this.planCards.count();
  }

  async getFreePlanFeatures(): Promise<string[]> {
    const features: string[] = [];
    const list = this.freePlanCard.locator("li");
    const items = await list.all();

    for (const item of items) {
      const text = await item.textContent();
      if (text) features.push(text.trim());
    }

    return features;
  }

  async getProPlanFeatures(): Promise<string[]> {
    const features: string[] = [];
    const list = this.proPlanCard.locator("li");
    const items = await list.all();

    for (const item of items) {
      const text = await item.textContent();
      if (text) features.push(text.trim());
    }

    return features;
  }

  async getProPlanPrice(): Promise<string | null> {
    const priceElement = this.proPlanCard.locator("[data-testid='price'], .price, text=/\\$\\d+/").first();
    if (!(await priceElement.isVisible())) return null;
    return priceElement.textContent();
  }

  async hasPopularBadge(): Promise<boolean> {
    return this.popularBadge.isVisible();
  }

  // --- Billing Toggle ---

  async selectMonthlyBilling() {
    if (await this.monthlyOption.isVisible()) {
      await this.monthlyOption.click();
      await this.page.waitForTimeout(300);
    }
  }

  async selectYearlyBilling() {
    if (await this.yearlyOption.isVisible()) {
      await this.yearlyOption.click();
      await this.page.waitForTimeout(300);
    }
  }

  async hasBillingToggle(): Promise<boolean> {
    return this.billingToggle.isVisible();
  }

  // --- CTAs ---

  async clickGetStarted() {
    await this.getStartedButton.click();
    await this.waitForNavigation();
  }

  async clickUpgradeToPro() {
    await this.upgradeToPro.click();
    // May open checkout or login modal
  }

  async getCtaButtonTexts(): Promise<string[]> {
    const buttons = await this.ctaButtons.all();
    const texts: string[] = [];

    for (const button of buttons) {
      const text = await button.textContent();
      if (text) texts.push(text.trim());
    }

    return texts;
  }

  // --- FAQ ---

  async hasFaqSection(): Promise<boolean> {
    return this.faqSection.isVisible();
  }

  async getFaqCount(): Promise<number> {
    if (!(await this.hasFaqSection())) return 0;
    return this.faqItems.count();
  }

  async expandFaqItem(index: number) {
    const items = await this.faqItems.all();
    if (index >= items.length) {
      throw new Error(`FAQ index ${index} out of bounds (${items.length} items)`);
    }
    await items[index].click();
  }

  // --- Assertions ---

  async assertPricingDisplayed() {
    await this.assertVisible(this.pageTitle);
    const planCount = await this.getPlanCount();
    if (planCount < 1) {
      throw new Error("Expected at least 1 pricing plan");
    }
  }

  async assertHasFeatureComparison() {
    const freeFeatures = await this.getFreePlanFeatures();
    const proFeatures = await this.getProPlanFeatures();

    if (freeFeatures.length === 0 && proFeatures.length === 0) {
      throw new Error("Expected plans to have feature lists");
    }
  }

  async assertProPlanHighlighted() {
    const hasPopular = await this.hasPopularBadge();
    if (!hasPopular) {
      // Check for other highlighting indicators
      const proCard = this.proPlanCard;
      const classList = await proCard.getAttribute("class");
      const hasHighlight = classList?.includes("highlight") || classList?.includes("featured") || classList?.includes("primary");

      if (!hasHighlight) {
        console.warn("Pro plan may not be visually highlighted");
      }
    }
  }
}

export default PricingPage;
