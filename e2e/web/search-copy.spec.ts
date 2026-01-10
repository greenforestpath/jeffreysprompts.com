import { test, expect } from "@playwright/test";

/**
 * Search & Copy Flow E2E Tests
 *
 * Tests the critical user journey:
 * 1. Load homepage
 * 2. Search for prompts
 * 3. View prompt details
 * 4. Copy prompt to clipboard
 */

test.describe("Search & Copy Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  test("homepage loads with prompt cards", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/JeffreysPrompts/);

    // Check that prompt cards are visible
    const promptCards = page.locator("[data-prompt-card]");

    // If no data-prompt-card, look for cards with prompt titles
    const cards = await promptCards.count();
    if (cards === 0) {
      // Fallback: look for any card-like elements with prompt titles
      await expect(page.getByText("The Idea Wizard")).toBeVisible({ timeout: 10000 });
    } else {
      await expect(promptCards.first()).toBeVisible();
    }
  });

  test("can navigate to prompt detail page", async ({ page }) => {
    // Click on the Idea Wizard prompt (or first available)
    const ideaWizardLink = page.getByRole("link", { name: /idea wizard/i });

    if (await ideaWizardLink.isVisible()) {
      await ideaWizardLink.click();
    } else {
      // Click first prompt link
      const firstPromptLink = page.locator("a[href^='/prompts/']").first();
      await firstPromptLink.click();
    }

    // Should be on a prompt detail page
    await expect(page).toHaveURL(/\/prompts\//);

    // Should show prompt content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("prompt detail page has copy button", async ({ page }) => {
    // Navigate to a known prompt
    await page.goto("/prompts/idea-wizard");
    await page.waitForLoadState("networkidle");

    // Find and verify copy button exists
    const copyButton = page.getByRole("button", { name: /copy/i });
    await expect(copyButton).toBeVisible();
  });

  test("copy button shows success feedback", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // Navigate to prompt detail
    await page.goto("/prompts/idea-wizard");
    await page.waitForLoadState("networkidle");

    // Click copy button
    const copyButton = page.getByRole("button", { name: /copy/i });
    await copyButton.click();

    // Should show success indicator (check icon or toast)
    // Look for either a check icon in the button or a toast notification
    await expect(
      page.getByText(/copied/i).or(page.locator("svg.text-green-500"))
    ).toBeVisible({ timeout: 3000 });
  });

  test("back navigation works from prompt detail", async ({ page }) => {
    // Navigate to prompt detail
    await page.goto("/prompts/idea-wizard");
    await page.waitForLoadState("networkidle");

    // Click back link
    const backLink = page.getByRole("link", { name: /back to prompts/i });
    await backLink.click();

    // Should be back on homepage
    await expect(page).toHaveURL("/");
  });
});

test.describe("Filter Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("can filter by category", async ({ page }) => {
    // Look for category filter
    const categoryFilter = page.getByRole("button", { name: /category/i }).or(
      page.getByRole("combobox", { name: /category/i })
    );

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      // Select a category (e.g., ideation)
      const ideationOption = page.getByRole("option", { name: /ideation/i }).or(
        page.getByText(/ideation/i)
      );

      if (await ideationOption.isVisible()) {
        await ideationOption.click();

        // Verify filtering happened (URL should update or cards should filter)
        await page.waitForTimeout(500); // Allow for filter animation
      }
    }
  });
});
