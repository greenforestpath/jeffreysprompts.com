/**
 * Homepage E2E Tests using Page Object Model
 *
 * This spec demonstrates the enhanced testing patterns:
 * - Page Objects for encapsulated interactions
 * - Console error monitoring
 * - Hydration error detection
 * - Mobile/desktop responsive checks
 *
 * Run with: bunx playwright test --config e2e/playwright.config.ts e2e/web/homepage-pom.spec.ts
 */

import { test, expect } from "../fixtures/pages";

test.describe("Homepage - Page Object Model", () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test("loads without console errors", async ({ homePage, assertNoConsoleErrors }) => {
    // Page loaded in beforeEach
    await homePage.waitForPageLoad();

    // Assert no unexpected console errors occurred
    await assertNoConsoleErrors();
  });

  test("has no hydration mismatches", async ({ homePage }) => {
    await homePage.waitForPageLoad();

    // Check for hydration errors (SSR/client mismatch)
    expect(homePage.hasHydrationErrors()).toBe(false);
  });

  test("displays hero section correctly", async ({ homePage }) => {
    // Verify headline is visible
    await homePage.assertVisible(homePage.headline);

    // Verify search input is functional
    await homePage.assertVisible(homePage.searchInput);

    // Verify CLI install button
    await homePage.assertVisible(homePage.installCliButton);
  });

  test("displays prompt grid with multiple cards", async ({ homePage }) => {
    const cardCount = await homePage.getPromptCardCount();

    expect(cardCount).toBeGreaterThanOrEqual(3);
  });

  test("can search for prompts", async ({ homePage }) => {
    // Get initial count
    const initialCount = await homePage.getPromptCardCount();

    // Search for a specific term
    await homePage.search("wizard");

    // Wait for filter to apply
    await homePage.page.waitForTimeout(500);

    // Should filter results
    const titles = await homePage.getPromptTitles();

    // At least one result should contain the search term
    const hasMatch = titles.some((title) => title.toLowerCase().includes("wizard"));
    expect(hasMatch).toBe(true);
  });

  test("can filter by category", async ({ homePage }) => {
    // Get available categories
    const categories = await homePage.getCategoryButtons();
    expect(categories.length).toBeGreaterThanOrEqual(5);

    // Select a specific category
    if (categories.includes("ideation") || categories.some((c) => c.toLowerCase() === "ideation")) {
      await homePage.selectCategory("ideation");

      // Verify prompts are filtered
      const titles = await homePage.getPromptTitles();
      expect(titles.length).toBeGreaterThan(0);
    }
  });

  test("displays stats counters", async ({ homePage }) => {
    // Check for prompt count stat
    const promptCount = await homePage.getStatValue("Prompts");
    expect(promptCount).not.toBeNull();

    // Check for category count stat
    const categoryCount = await homePage.getStatValue("Categories");
    expect(categoryCount).not.toBeNull();
  });

  test("footer displays correctly", async ({ homePage }) => {
    await homePage.scrollToFooter();

    // Verify site name
    const siteName = await homePage.getFooterSiteName();
    expect(siteName).toContain("JeffreysPrompts");

    // Verify install command
    const installCmd = await homePage.getInstallCommand();
    expect(installCmd).toContain("jeffreysprompts.com/install");

    // Verify social links exist
    await homePage.assertVisible(homePage.githubLink);
    await homePage.assertVisible(homePage.twitterLink);
  });
});

test.describe("Homepage - Responsive Layout", () => {
  test("mobile layout is touch-friendly", async ({ homePage, page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await homePage.goto();

    // Verify mobile layout
    await homePage.assertMobileLayout();

    // Verify no console errors on mobile
    expect(homePage.getUnexpectedErrors()).toHaveLength(0);
  });

  test("desktop layout shows multi-column grid", async ({ homePage, page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    await homePage.goto();

    // Verify desktop layout
    await homePage.assertDesktopLayout();

    // Should have multiple cards in grid
    const cardCount = await homePage.getPromptCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("tablet layout works correctly", async ({ homePage, page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await homePage.goto();

    // Page should load without errors
    await homePage.waitForPageLoad();
    expect(homePage.getUnexpectedErrors()).toHaveLength(0);
  });
});

test.describe("Homepage - Performance", () => {
  test("page loads within acceptable time", async ({ homePage, page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const domContentLoaded = Date.now() - startTime;

    await page.waitForLoadState("networkidle");
    const fullLoad = Date.now() - startTime;

    // DOMContentLoaded should be under 10 seconds (dev mode can be slow)
    expect(domContentLoaded).toBeLessThan(10000);

    // Full load should be under 30 seconds
    expect(fullLoad).toBeLessThan(30000);
  });

  test("no layout shift after render", async ({ homePage }) => {
    await homePage.goto();

    // Wait for a card to be visible
    const cardTitle = homePage.page.locator("h3").first();
    await homePage.assertVisible(cardTitle);

    // Wait for stable position
    await homePage.waitForStablePosition(cardTitle);
  });
});

test.describe("Homepage - Network Resilience", () => {
  test("handles slow network gracefully", async ({ homePage, page }) => {
    // Simulate slow 3G
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500 Kbps
      uploadThroughput: (500 * 1024) / 8,
      latency: 400, // 400ms
    });

    await homePage.goto();

    // Should still load (with longer timeout)
    await homePage.waitForPageLoad(30000);

    // Should not have network errors (may have warnings)
    const networkErrors = homePage.getConsoleErrors("network");
    expect(networkErrors).toHaveLength(0);
  });
});

test.describe("Homepage - Accessibility Basics", () => {
  test("has proper heading hierarchy", async ({ homePage }) => {
    await homePage.goto();

    // Should have exactly one h1
    const h1Count = await homePage.page.locator("h1").count();
    expect(h1Count).toBe(1);

    // h1 should be visible
    await homePage.assertVisible(homePage.headline);
  });

  test("search input is accessible", async ({ homePage }) => {
    await homePage.goto();

    // Search input should be visible and enabled
    await homePage.assertVisible(homePage.searchInput);
    await expect(homePage.searchInput).toBeEnabled();

    // Should have placeholder for context
    const placeholder = await homePage.searchInput.getAttribute("placeholder");
    expect(placeholder).toBeTruthy();
  });

  test("buttons have accessible names", async ({ homePage }) => {
    await homePage.goto();

    // Install CLI button should have accessible name
    const installButton = homePage.installCliButton;
    await homePage.assertVisible(installButton);

    const name = await installButton.getAttribute("aria-label") || await installButton.textContent();
    expect(name).toBeTruthy();
  });
});
