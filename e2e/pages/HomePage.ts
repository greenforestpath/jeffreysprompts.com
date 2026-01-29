/**
 * HomePage Page Object
 *
 * Encapsulates interactions with the JeffreysPrompts homepage:
 * - Hero section with search and stats
 * - Category filter pills
 * - Prompt grid with cards
 * - Footer with social links
 */

import { type Page, type Locator, type TestInfo } from "@playwright/test";
import { BasePage } from "./BasePage";
import { type ConsoleMonitor } from "../utils/console-monitor";

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class HomePage extends BasePage {
  static readonly PATH = "/";

  // --- Hero Section Locators ---
  readonly heroSection: Locator;
  readonly headline: Locator;
  readonly tagline: Locator;
  readonly searchInput: Locator;
  readonly installCliButton: Locator;
  readonly statsSection: Locator;

  // --- Category Filter Locators ---
  readonly categoryFilterGroup: Locator;
  readonly allCategoryButton: Locator;

  // --- Prompt Grid Locators ---
  readonly promptGrid: Locator;
  readonly promptCards: Locator;
  readonly allPromptsHeading: Locator;
  readonly promptCountText: Locator;

  // --- Footer Locators ---
  readonly footer: Locator;
  readonly footerSiteName: Locator;
  readonly githubLink: Locator;
  readonly twitterLink: Locator;
  readonly installCommand: Locator;

  constructor(page: Page, testInfo?: TestInfo, sharedConsoleMonitor?: ConsoleMonitor) {
    super(page, testInfo, sharedConsoleMonitor);

    // Hero section
    this.heroSection = page.locator("section").first();
    this.headline = page.getByRole("heading", { level: 1 });
    this.tagline = page.getByText(/collection of .* prompts/i);
    this.searchInput = page.getByPlaceholder("Search prompts...");
    this.installCliButton = page.getByRole("button", { name: /install cli/i });
    this.statsSection = page.locator("[class*='stats'], [class*='counter']").first();

    // Category filter
    this.categoryFilterGroup = page.locator("[aria-label='Filter by category']");
    this.allCategoryButton = this.categoryFilterGroup.locator("button").first();

    // Prompt grid
    this.promptGrid = page.locator(".grid.gap-6");
    this.promptCards = this.promptGrid.locator("> div");
    this.allPromptsHeading = page.getByRole("heading", { name: "All Prompts" });
    this.promptCountText = page.locator("text=/\\d+ prompts?/");

    // Footer
    this.footer = page.locator("footer").filter({ hasText: "JeffreysPrompts.com" }).first();
    this.footerSiteName = page.locator("footer h3").getByText("JeffreysPrompts.com");
    this.githubLink = this.footer.getByRole("link", { name: /github/i }).first();
    this.twitterLink = this.footer.getByRole("link", { name: /twitter/i }).first();
    this.installCommand = this.footer.locator("code").first();
  }

  // --- Navigation ---

  async goto() {
    await super.goto(HomePage.PATH, { waitUntil: "networkidle" });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(timeout = 10000) {
    await this.assertVisible(this.headline, { timeout });
    await this.waitForSpinnersToDisappear();
  }

  // --- Hero Section ---

  async getHeadlineText(): Promise<string> {
    return (await this.headline.textContent()) ?? "";
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce
    await this.page.waitForTimeout(500);
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  async clickInstallCli() {
    await this.installCliButton.click();
  }

  async getStatValue(statName: string): Promise<string | null> {
    const stat = this.page.getByText(statName).first();
    if (!(await stat.isVisible())) return null;

    // Find the numeric value near this stat
    const parent = stat.locator("xpath=..");
    const text = await parent.textContent();
    const match = text?.match(/(\d+)/);
    return match ? match[1] : null;
  }

  // --- Category Filter ---

  async getCategoryButtons(): Promise<string[]> {
    const buttons = await this.categoryFilterGroup.locator("button").all();
    const names: string[] = [];
    for (const button of buttons) {
      const text = await button.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  async selectCategory(category: string) {
    const button = this.page.getByRole("button", { name: new RegExp(`^${escapeRegex(category)}$`, "i") });
    await button.click();
    await this.page.waitForTimeout(300); // Wait for filter animation
  }

  async selectAllCategories() {
    await this.allCategoryButton.click();
    await this.page.waitForTimeout(300);
  }

  // --- Prompt Grid ---

  async getPromptCardCount(): Promise<number> {
    await this.assertVisible(this.promptGrid);
    return this.promptCards.count();
  }

  async getPromptTitles(): Promise<string[]> {
    await this.assertVisible(this.promptGrid);
    const cards = await this.promptCards.all();
    const titles: string[] = [];

    for (const card of cards) {
      const title = card.locator("h3");
      if (await title.isVisible()) {
        const text = await title.textContent();
        if (text) titles.push(text.trim());
      }
    }

    return titles;
  }

  async getDisplayedPromptCount(): Promise<number | null> {
    const countText = await this.promptCountText.textContent();
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  async clickPromptCard(title: string) {
    const card = this.page.locator("h3").filter({ hasText: title }).locator("../..");
    await card.click();
    await this.waitForNavigation();
  }

  async copyPrompt(title: string) {
    const card = this.page.locator("h3").filter({ hasText: title }).locator("../..");
    const copyButton = card.getByRole("button", { name: /copy/i });
    await copyButton.click();
  }

  async viewPromptDetails(title: string) {
    const card = this.page.locator("h3").filter({ hasText: title }).locator("../..");
    const viewButton = card.getByRole("button", { name: /view/i });
    await viewButton.click();
    await this.waitForNavigation();
  }

  // --- Tag Filters ---

  async getVisibleTags(): Promise<string[]> {
    const tagButtons = this.page.locator("button").filter({ hasText: /^[a-z-]+$/i });
    const tags: string[] = [];

    const buttons = await tagButtons.all();
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.length < 30) {
        tags.push(text.trim());
      }
    }

    return tags;
  }

  async selectTag(tag: string) {
    const button = this.page.getByRole("button", { name: new RegExp(`^${escapeRegex(tag)}$`, "i") });
    await button.click();
    await this.page.waitForTimeout(300);
  }

  async clearFilters() {
    const clearButton = this.page.getByText("Clear all filters");
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  // --- Footer ---

  async scrollToFooter() {
    await this.footer.scrollIntoViewIfNeeded();
  }

  async getFooterSiteName(): Promise<string | null> {
    await this.scrollToFooter();
    return this.footerSiteName.textContent();
  }

  async clickGitHubLink() {
    await this.scrollToFooter();
    await this.githubLink.click();
  }

  async getInstallCommand(): Promise<string | null> {
    await this.scrollToFooter();
    return this.installCommand.textContent();
  }

  // --- Responsive Checks ---

  async assertMobileLayout() {
    // On mobile, grid should be single column
    await this.assertVisible(this.promptGrid);

    // Search input should be full width and touch-friendly
    const searchHeight = await this.searchInput.evaluate((el) => el.offsetHeight);
    if (searchHeight < 48) {
      throw new Error(`Search input height (${searchHeight}px) is not touch-friendly (min 48px)`);
    }
  }

  async assertDesktopLayout() {
    // On desktop, grid should show multiple columns
    await this.assertVisible(this.promptGrid);
    // lg:grid-cols-3 should apply
  }
}

export default HomePage;
