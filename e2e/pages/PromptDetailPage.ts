/**
 * PromptDetailPage Page Object
 *
 * Encapsulates interactions with individual prompt pages:
 * - Prompt content display
 * - Copy functionality
 * - Metadata (category, tags, author)
 * - Related prompts
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

export class PromptDetailPage extends BasePage {
  static readonly PATH_PATTERN = /\/prompts\/[\w-]+/;

  // --- Main Content Locators ---
  readonly promptTitle: Locator;
  readonly promptContent: Locator;
  readonly promptDescription: Locator;
  readonly copyButton: Locator;
  readonly copySuccessToast: Locator;

  // --- Metadata Locators ---
  readonly categoryBadge: Locator;
  readonly tagsList: Locator;
  readonly tagButtons: Locator;
  readonly authorInfo: Locator;

  // --- Actions Locators ---
  readonly backButton: Locator;
  readonly shareButton: Locator;
  readonly addToBasketButton: Locator;

  // --- Related Content ---
  readonly relatedPromptsSection: Locator;
  readonly relatedPromptCards: Locator;

  constructor(page: Page, testInfo?: TestInfo, sharedConsoleMonitor?: ConsoleMonitor) {
    super(page, testInfo, sharedConsoleMonitor);

    // Main content
    this.promptTitle = page.getByRole("heading", { level: 1 });
    this.promptContent = page.locator("[data-testid='prompt-content'], pre, code").first();
    this.promptDescription = page.locator("[data-testid='prompt-description'], .description").first();
    this.copyButton = page.getByRole("button", { name: /copy/i }).first();
    this.copySuccessToast = page.getByText(/copied/i);

    // Metadata
    this.categoryBadge = page.locator(".capitalize, [data-testid='category-badge']").first();
    this.tagsList = page.locator("[data-testid='tags-list'], .tags");
    this.tagButtons = page.locator("button, a").filter({ hasText: /^[a-z-]+$/i });
    this.authorInfo = page.locator("[data-testid='author-info']");

    // Actions
    this.backButton = page.getByRole("button", { name: /back|return/i }).or(page.getByRole("link", { name: /back/i }));
    this.shareButton = page.getByRole("button", { name: /share/i });
    this.addToBasketButton = page.getByRole("button", { name: /add.*basket|basket/i });

    // Related content
    this.relatedPromptsSection = page.locator("[data-testid='related-prompts'], section:has-text('Related')");
    this.relatedPromptCards = this.relatedPromptsSection.locator(".card, [data-testid='prompt-card']");
  }

  // --- Navigation ---

  async goto(promptId: string) {
    await super.goto(`/prompts/${promptId}`, { waitUntil: "networkidle" });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(timeout = 10000) {
    await this.assertVisible(this.promptTitle, { timeout });
    await this.waitForSpinnersToDisappear();
  }

  // --- Content ---

  async getTitle(): Promise<string> {
    return (await this.promptTitle.textContent()) ?? "";
  }

  async getContent(): Promise<string> {
    return (await this.promptContent.textContent()) ?? "";
  }

  async getDescription(): Promise<string | null> {
    if (!(await this.promptDescription.isVisible())) return null;
    return this.promptDescription.textContent();
  }

  // --- Actions ---

  async copyPrompt() {
    await this.copyButton.click();
    // Wait for copy confirmation
    await this.page.waitForTimeout(100);
  }

  async assertCopySuccess() {
    await this.assertVisible(this.copySuccessToast, { timeout: 3000 });
  }

  async goBack() {
    await this.backButton.click();
    await this.waitForNavigation();
  }

  async share() {
    if (await this.shareButton.isVisible()) {
      await this.shareButton.click();
    }
  }

  async addToBasket() {
    if (await this.addToBasketButton.isVisible()) {
      await this.addToBasketButton.click();
    }
  }

  // --- Metadata ---

  async getCategory(): Promise<string | null> {
    if (!(await this.categoryBadge.isVisible())) return null;
    return this.categoryBadge.textContent();
  }

  async getTags(): Promise<string[]> {
    const buttons = await this.tagButtons.all();
    const tags: string[] = [];

    for (const button of buttons) {
      const text = await button.textContent();
      if (text && text.length < 30 && /^[a-z-]+$/i.test(text.trim())) {
        tags.push(text.trim());
      }
    }

    return tags;
  }

  async clickTag(tag: string) {
    const escapedTag = escapeRegex(tag);
    const tagButton = this.page.getByRole("button", { name: new RegExp(`^${escapedTag}$`, "i") }).or(
      this.page.getByRole("link", { name: new RegExp(`^${escapedTag}$`, "i") })
    );
    await tagButton.click();
    await this.waitForNavigation();
  }

  // --- Related Prompts ---

  async hasRelatedPrompts(): Promise<boolean> {
    return this.relatedPromptsSection.isVisible();
  }

  async getRelatedPromptCount(): Promise<number> {
    if (!(await this.hasRelatedPrompts())) return 0;
    return this.relatedPromptCards.count();
  }

  async clickRelatedPrompt(index: number) {
    const cards = await this.relatedPromptCards.all();
    if (index >= cards.length) {
      throw new Error(`Related prompt index ${index} out of bounds (${cards.length} cards)`);
    }
    await cards[index].click();
    await this.waitForNavigation();
  }

  // --- Assertions ---

  async assertPromptDisplayed() {
    await this.assertVisible(this.promptTitle);
    await this.assertVisible(this.promptContent);
    await this.assertVisible(this.copyButton);
  }

  async assertHasCategory() {
    const category = await this.getCategory();
    if (!category) {
      throw new Error("Expected prompt to have a category");
    }
  }

  async assertHasTags(minTags = 1) {
    const tags = await this.getTags();
    if (tags.length < minTags) {
      throw new Error(`Expected at least ${minTags} tags, found ${tags.length}`);
    }
  }
}

export default PromptDetailPage;
