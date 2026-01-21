import { test, expect } from "../../lib/playwright-logger";

/**
 * What's New Modal E2E Tests
 *
 * Tests for the "What's New" modal that shows after updates.
 * NOTE: These tests are skipped until the What's New modal is implemented.
 *
 * Planned test scenarios:
 * 1. Modal shows for new features
 * 2. Modal dismisses correctly
 * 3. "Don't show again" persists
 * 4. Images/GIFs display properly
 */

test.describe("What's New Modal", () => {
  // Feature not yet implemented - skip all tests
  test.skip("modal shows on first visit after update", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify what's new modal appears", async () => {
      // Modal should appear with new feature highlights
      const modal = page.getByRole("dialog", { name: /what's new/i });
      await expect(modal).toBeVisible({ timeout: 5000 });
    });
  });

  test.skip("modal can be dismissed", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("dismiss the modal", async () => {
      const dismissButton = page.getByRole("button", { name: /got it|dismiss|close/i });
      await dismissButton.click();
    });

    await logger.step("verify modal is hidden", async () => {
      const modal = page.getByRole("dialog", { name: /what's new/i });
      await expect(modal).not.toBeVisible();
    });
  });

  test.skip("don't show again checkbox persists", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("check don't show again", async () => {
      const checkbox = page.getByLabel(/don't show again/i);
      await checkbox.check();
    });

    await logger.step("dismiss modal", async () => {
      const dismissButton = page.getByRole("button", { name: /got it|dismiss/i });
      await dismissButton.click();
    });

    await logger.step("reload page", async () => {
      await page.reload();
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify modal does not appear", async () => {
      const modal = page.getByRole("dialog", { name: /what's new/i });
      await expect(modal).not.toBeVisible();
    });
  });

  test.skip("modal displays feature images", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify images in modal", async () => {
      const modal = page.getByRole("dialog", { name: /what's new/i });
      const images = modal.locator("img");
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
    });

    await logger.step("verify images load correctly", async () => {
      const modal = page.getByRole("dialog", { name: /what's new/i });
      const images = modal.locator("img");
      const first = images.first();
      await expect(first).toHaveAttribute("src", /.+/);
    });
  });

  test.skip("modal links to full changelog", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("click changelog link in modal", async () => {
      const modal = page.getByRole("dialog", { name: /what's new/i });
      const changelogLink = modal.getByRole("link", { name: /see all updates|changelog/i });
      await changelogLink.click();
    });

    await logger.step("verify navigation to changelog", async () => {
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/changelog");
    });
  });
});
