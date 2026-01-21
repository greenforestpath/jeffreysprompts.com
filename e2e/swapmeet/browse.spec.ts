import { test, expect } from "../lib/playwright-logger";
import {
  gotoSwapMeet,
  getCommunityPromptCards,
  getCommunityPromptTitles,
  openMoreFilters,
  selectSortOption,
} from "../lib/swapmeet-helpers";

/**
 * Swap Meet Browse E2E Tests
 * Covers: page load, featured section, filters, sorting, and load more.
 */

test.setTimeout(60000);

test.describe("Swap Meet - Browse", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to Swap Meet", async () => {
      await gotoSwapMeet(page);
    });
  });

  test("page loads with hero content", async ({ page, logger }) => {
    await logger.step("verify hero badge and title", async () => {
      await expect(page.getByText("Community Marketplace")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: "Swap Meet" })).toBeVisible();
    });

    await logger.step("verify search input", async () => {
      await expect(page.getByPlaceholder("Search community prompts...")).toBeVisible();
    });

    await logger.step("verify quick stats", async () => {
      await expect(page.getByText("Community Prompts")).toBeVisible();
      await expect(page.getByText("Contributors")).toBeVisible();
      await expect(page.getByText("Total Copies")).toBeVisible();
    });
  });

  test("featured section displays when no filters applied", async ({ page, logger }) => {
    await logger.step("verify Editor's Picks header", async () => {
      await expect(page.getByRole("heading", { name: "Editor's Picks" })).toBeVisible();
    });

    await logger.step("verify featured cards exist", async () => {
      const featuredCards = page.locator("[data-testid='community-prompt-card'][data-featured='true']");
      const count = await featuredCards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test("category pills and more filters work", async ({ page, logger }) => {
    await logger.step("verify core category pills", async () => {
      await expect(page.getByRole("button", { name: "All Categories" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Ideation" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Documentation" })).toBeVisible();
    });

    await logger.step("open additional filters", async () => {
      await openMoreFilters(page);
    });

    await logger.step("verify expanded category options", async () => {
      await expect(page.getByRole("button", { name: "Testing" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Workflow" })).toBeVisible();
    });
  });

  test("sort dropdown changes ordering", async ({ page, logger }) => {
    await logger.step("set sort to Newest", async () => {
      await selectSortOption(page, "Newest");
    });

    await logger.step("verify sort selection", async () => {
      const combobox = page.getByRole("combobox");
      await expect(combobox).toContainText("Newest");
    });

    await logger.step("verify first card matches newest prompt", async () => {
      const titles = getCommunityPromptTitles(page);
      await expect(titles.first()).toHaveText("Ultimate Code Review Assistant");
    });
  });

  test("load more button is visible", async ({ page, logger }) => {
    await logger.step("verify load more prompt button", async () => {
      await expect(page.getByRole("button", { name: "Load More Prompts" })).toBeVisible();
    });

    await logger.step("ensure prompts are rendered", async () => {
      const cards = getCommunityPromptCards(page);
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });
});
