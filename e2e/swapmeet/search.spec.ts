import { test, expect } from "../lib/playwright-logger";
import {
  gotoSwapMeet,
  getSwapMeetSearchInput,
  getCommunityPromptCards,
  openMoreFilters,
  readResultsCount,
} from "../lib/swapmeet-helpers";

/**
 * Swap Meet Search and Filter E2E Tests
 */

test.setTimeout(60000);

test.describe("Swap Meet - Search & Filters", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to Swap Meet", async () => {
      await gotoSwapMeet(page);
    });
  });

  test("search filters results by query", async ({ page, logger }) => {
    await logger.step("enter search query", async () => {
      const input = getSwapMeetSearchInput(page);
      await input.fill("story");
    });

    await logger.step("verify results include Creative Story Generator", async () => {
      await expect(page.getByText("Creative Story Generator")).toBeVisible();
    });

    await logger.step("log result count", async () => {
      const count = await getCommunityPromptCards(page).count();
      const headerCount = await readResultsCount(page);
      logger.debug("search results count", { domCount: count, headerCount });
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test("category filter narrows results", async ({ page, logger }) => {
    await logger.step("open more filters", async () => {
      await openMoreFilters(page);
    });

    await logger.step("select Testing category", async () => {
      await page.getByRole("button", { name: "Testing" }).click();
    });

    await logger.step("verify Test Case Generator appears", async () => {
      await expect(page.getByText("Test Case Generator")).toBeVisible();
    });

    await logger.step("verify non-testing prompts are filtered out", async () => {
      await expect(page.getByText("Creative Story Generator")).not.toBeVisible();
    });
  });

  test("empty state and clear filters", async ({ page, logger }) => {
    await logger.step("search for a missing prompt", async () => {
      const input = getSwapMeetSearchInput(page);
      await input.fill("nonexistent-prompt-xyz");
    });

    await logger.step("verify empty state", async () => {
      await expect(page.getByRole("heading", { name: "No prompts found" })).toBeVisible();
      await expect(page.getByText("Try adjusting your search or filters")).toBeVisible();
    });

    await logger.step("clear filters", async () => {
      await page.getByRole("button", { name: "Clear Filters" }).click();
    });

    await logger.step("verify prompts are visible again", async () => {
      const card = page
        .locator("[data-testid='community-prompt-card']")
        .filter({ hasText: "Ultimate Code Review Assistant" })
        .first();
      await expect(card).toBeVisible();
    });
  });
});
