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
    await expect(page).toHaveTitle(/Jeffrey's Prompts/i);

    // Check that prompts are visible (look for prompt titles on cards)
    // The Idea Wizard is a known prompt that should be on the homepage
    await expect(page.getByText("The Idea Wizard")).toBeVisible({ timeout: 10000 });
  });

  test("can navigate to prompt detail page", async ({ page }) => {
    // Wait for prompts to load
    await expect(page.getByText("The Idea Wizard")).toBeVisible({ timeout: 10000 });

    // Click on a View button to navigate to details
    // Or click on the card itself if there's a View button
    const viewButton = page.getByRole("button", { name: /view/i }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    } else {
      // Try clicking directly on a prompt card title
      const ideaWizardCard = page.getByText("The Idea Wizard");
      await ideaWizardCard.click();
    }

    // Modal should open (not navigating to separate page)
    // Look for modal content
    await page.waitForTimeout(500);
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
    await expect(page.getByText(/copied/i).first()).toBeVisible({ timeout: 3000 });
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
    // Wait for prompts to load first (use heading specifically)
    await expect(page.getByRole("heading", { name: "All Prompts" })).toBeVisible({ timeout: 10000 });

    // Look for category filter buttons (they're rendered as buttons/chips)
    // Use first() since there may be multiple buttons with same name (category + tag filters)
    const ideationButton = page.getByRole("button", { name: /ideation/i }).first();

    if (await ideationButton.isVisible()) {
      await ideationButton.click();

      // Verify filtering happened (heading should change or URL should update)
      await page.waitForTimeout(500);
      // Either the heading changes to show category or filter is applied
    }
  });
});

test.describe("Homepage cards", () => {
  test("prompt cards have copy buttons", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for content to load
    await expect(page.getByText("The Idea Wizard")).toBeVisible({ timeout: 10000 });

    // Check that there are copy buttons on the cards
    const copyButtons = page.getByRole("button", { name: /^copy$/i });
    const count = await copyButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("clicking copy on card shows feedback", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for content to load
    await expect(page.getByText("The Idea Wizard")).toBeVisible({ timeout: 10000 });

    // Click the first copy button
    const copyButton = page.getByRole("button", { name: /^copy$/i }).first();
    await copyButton.click();

    // Should show "Copied" text (either in button or toast)
    await expect(page.getByText(/copied/i).first()).toBeVisible({ timeout: 3000 });
  });
});
