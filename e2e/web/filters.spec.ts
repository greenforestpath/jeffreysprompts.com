import { test, expect } from "../lib/playwright-logger";

/**
 * Filter E2E Tests
 *
 * Tests for multi-tag and category filtering:
 * 1. Select/deselect single tags
 * 2. Multi-tag combinations (AND logic)
 * 3. Category filter selection
 * 4. Combined category + tag filtering
 * 5. Clear filters functionality
 * 6. URL state synchronization
 */

test.describe("Multi-Tag Filter Combinations", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });
  });

  test("can select a single tag", async ({ page, logger }) => {
    await logger.step("wait for tags to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("click on a tag", async () => {
      const tagButton = page.getByRole("button", { name: /brainstorming/i }).first();
      await tagButton.click();
    });

    await logger.step("verify tag is selected", async () => {
      const tagButton = page.getByRole("button", { name: /brainstorming/i }).first();
      await expect(tagButton).toHaveAttribute("aria-pressed", "true");
    });

    await logger.step("verify URL updated with tag", async () => {
      await expect(page).toHaveURL(/tags=brainstorming/);
    });
  });

  test("can deselect a tag", async ({ page, logger }) => {
    await logger.step("wait for tags to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("select a tag", async () => {
      const tagsGroup = page.getByRole("group", { name: "Tags" });
      const tagButton = tagsGroup.getByRole("button", { name: /brainstorming/i });
      await tagButton.click();
      await expect(tagButton).toHaveAttribute("aria-pressed", "true");
      await page.waitForURL(/tags=brainstorming/);
    });

    await logger.step("deselect the tag", async () => {
      const tagsGroup = page.getByRole("group", { name: "Tags" });
      const tagButton = tagsGroup.getByRole("button", { name: /brainstorming/i });
      await tagButton.click();
      // Wait for the deselection to take effect
      await expect(tagButton).toHaveAttribute("aria-pressed", "false", { timeout: 5000 });
    });

    await logger.step("verify URL no longer contains tag", async () => {
      await expect(page).not.toHaveURL(/tags=/, { timeout: 5000 });
    });
  });

  test("shows clear button when tags are selected", async ({ page, logger }) => {
    await logger.step("wait for tags to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("verify clear button not visible initially", async () => {
      const clearButton = page.getByRole("button", { name: /clear.*selected.*tag/i });
      await expect(clearButton).not.toBeVisible();
    });

    await logger.step("select a tag", async () => {
      // Use the Tags group to find the correct button
      const tagsGroup = page.getByRole("group", { name: "Tags" });
      const tagButton = tagsGroup.getByRole("button", { name: /brainstorming/i });
      await tagButton.click();
    });

    await logger.step("verify clear button appears", async () => {
      const clearButton = page.getByRole("button", { name: /clear.*1.*selected.*tag/i });
      await expect(clearButton).toBeVisible();
    });
  });

  test("clear button clears selected tags", async ({ page, logger }) => {
    await logger.step("wait for tags to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("select a tag", async () => {
      const tagsGroup = page.getByRole("group", { name: "Tags" });
      const tagButton = tagsGroup.getByRole("button", { name: /brainstorming/i });
      await tagButton.click();
      await expect(tagButton).toHaveAttribute("aria-pressed", "true");
    });

    await logger.step("verify clear button appears", async () => {
      // Clear button appears with count
      await expect(page.getByRole("button", { name: /clear 1 selected/i })).toBeVisible();
    });

    await logger.step("click clear button", async () => {
      const clearButton = page.getByRole("button", { name: /clear 1 selected/i });
      await clearButton.click();
    });

    await logger.step("verify tag deselected", async () => {
      const tagsGroup = page.getByRole("group", { name: "Tags" });
      await expect(tagsGroup.getByRole("button", { name: /brainstorming/i })).toHaveAttribute("aria-pressed", "false", { timeout: 5000 });
    });

    await logger.step("verify URL cleared", async () => {
      await expect(page).not.toHaveURL(/tags=/, { timeout: 5000 });
    });
  });

  test("tag selection filters displayed prompts", async ({ page, logger }) => {
    await logger.step("wait for prompts to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("count initial prompts", async () => {
      const initialCount = await page.locator("h3").count();
      expect(initialCount).toBeGreaterThanOrEqual(3);
    });

    await logger.step("select automation tag", async () => {
      const tagButton = page.getByRole("button", { name: /^automation\s/i }).first();
      await tagButton.click();
    });

    await logger.step("verify filtered results", async () => {
      // Only prompts with "automation" tag should be visible
      await expect(page.getByRole("heading", { name: "The Robot-Mode Maker" })).toBeVisible();
    });
  });
});

test.describe("Category Filter Selection", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });
  });

  test("can select a category", async ({ page, logger }) => {
    await logger.step("wait for categories to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("click on ideation category", async () => {
      const categoryButton = page.getByRole("button", { name: /^ideation\s/i }).first();
      await categoryButton.click();
    });

    await logger.step("verify category is selected", async () => {
      const categoryButton = page.getByRole("button", { name: /^ideation\s/i }).first();
      await expect(categoryButton).toHaveAttribute("aria-pressed", "true");
    });

    await logger.step("verify URL updated", async () => {
      await expect(page).toHaveURL(/category=ideation/);
    });
  });

  test("All category is selected by default", async ({ page, logger }) => {
    await logger.step("wait for page to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("verify All button is pressed", async () => {
      const allButton = page.getByRole("button", { name: /^All\s/i }).first();
      await expect(allButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("selecting category deselects All", async ({ page, logger }) => {
    await logger.step("wait for categories to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("select ideation category", async () => {
      const categoryButton = page.getByRole("button", { name: /^ideation\s/i }).first();
      await categoryButton.click();
    });

    await logger.step("verify All is not pressed", async () => {
      const allButton = page.getByRole("button", { name: /^All\s/i }).first();
      await expect(allButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  test("clicking All clears category selection", async ({ page, logger }) => {
    await logger.step("navigate with category selected", async () => {
      // Start with a category already selected via URL
      await page.goto("/?category=ideation");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify category is selected", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
      const categoryGroup = page.getByRole("group", { name: "Filter by category" }).nth(1);
      await expect(categoryGroup.getByRole("button", { name: /^ideation/i })).toHaveAttribute("aria-pressed", "true");
    });

    await logger.step("click All button", async () => {
      const categoryGroup = page.getByRole("group", { name: "Filter by category" }).nth(1);
      const allButton = categoryGroup.getByRole("button", { name: /^All/i });
      await allButton.click();
    });

    await logger.step("verify category cleared from URL", async () => {
      await expect(page).not.toHaveURL(/category=/, { timeout: 5000 });
    });

    await logger.step("verify All is now selected", async () => {
      const categoryGroup = page.getByRole("group", { name: "Filter by category" }).nth(1);
      await expect(categoryGroup.getByRole("button", { name: /^All/i })).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("category selection filters prompts", async ({ page, logger }) => {
    await logger.step("wait for prompts to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("select documentation category", async () => {
      const categoryButton = page.getByRole("button", { name: /^documentation\s/i }).first();
      await categoryButton.click();
    });

    await logger.step("verify only documentation prompts shown", async () => {
      await expect(page.getByRole("heading", { name: "The README Reviser" })).toBeVisible();
      // Idea Wizard is ideation category, should not be visible
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).not.toBeVisible();
    });
  });
});

test.describe("Combined Category and Tag Filtering", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });
  });

  test("can combine category and tag filters", async ({ page, logger }) => {
    await logger.step("wait for prompts to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("select ideation category", async () => {
      // Use the main section category filter group (not hero)
      const categoryGroup = page.getByRole("group", { name: "Filter by category" }).nth(1);
      const categoryButton = categoryGroup.getByRole("button", { name: /^ideation\s/i });
      await categoryButton.click();
      await expect(page).toHaveURL(/category=ideation/, { timeout: 5000 });
    });

    await logger.step("select brainstorming tag", async () => {
      const tagsGroup = page.getByRole("group", { name: "Tags" });
      const tagButton = tagsGroup.getByRole("button", { name: /brainstorming/i });
      await tagButton.click();
      // Wait for URL to update
      await page.waitForTimeout(300);
    });

    await logger.step("verify URL has both filters", async () => {
      await expect(page).toHaveURL(/category=ideation/);
      await expect(page).toHaveURL(/tags=brainstorming/);
    });

    await logger.step("verify matching prompt is visible", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible();
    });
  });
});

test.describe("Filter State via URL", () => {
  test("loads filters from URL query params", async ({ page, logger }) => {
    await logger.step("navigate with query params", async () => {
      await page.goto("/?category=ideation&tags=brainstorming");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify category is selected", async () => {
      const categoryButton = page.getByRole("button", { name: /^ideation\s/i }).first();
      await expect(categoryButton).toHaveAttribute("aria-pressed", "true");
    });

    await logger.step("verify tag is selected", async () => {
      const tagButton = page.getByRole("button", { name: /brainstorming/i }).first();
      await expect(tagButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("loads multiple tags from URL", async ({ page, logger }) => {
    await logger.step("navigate with multiple tags", async () => {
      await page.goto("/?tags=brainstorming,improvement");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify both tags are selected", async () => {
      await expect(page.getByRole("button", { name: /brainstorming/i }).first()).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("button", { name: /improvement/i }).first()).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("filter changes update browser history", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("select a tag", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
      const tagButton = page.getByRole("button", { name: /brainstorming/i }).first();
      await tagButton.click();
    });

    await logger.step("verify URL changed", async () => {
      await expect(page).toHaveURL(/tags=brainstorming/);
    });

    await logger.step("navigate back", async () => {
      await page.goBack();
    });

    await logger.step("verify tag is deselected after back", async () => {
      await expect(page).not.toHaveURL(/tags=/);
      const tagButton = page.getByRole("button", { name: /brainstorming/i }).first();
      await expect(tagButton).toHaveAttribute("aria-pressed", "false");
    });
  });
});

test.describe("Filter with Search", () => {
  test("can combine search with filters", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("wait for prompts to load", async () => {
      await expect(page.getByRole("heading", { name: "The Idea Wizard" })).toBeVisible({ timeout: 10000 });
    });

    await logger.step("enter search query", async () => {
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill("idea");
    });

    await logger.step("select a tag", async () => {
      const tagButton = page.getByRole("button", { name: /brainstorming/i }).first();
      await tagButton.click();
    });

    await logger.step("verify URL has both search and tag", async () => {
      await expect(page).toHaveURL(/q=idea/);
      await expect(page).toHaveURL(/tags=brainstorming/);
    });
  });
});
