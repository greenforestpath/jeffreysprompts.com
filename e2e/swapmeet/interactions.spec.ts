import { test, expect } from "../lib/playwright-logger";
import { gotoSwapMeetPrompt } from "../lib/swapmeet-helpers";

/**
 * Swap Meet Interaction E2E Tests
 */

test.setTimeout(60000);

test.describe("Swap Meet - Interactions", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("open prompt detail", async () => {
      await gotoSwapMeetPrompt(page, "comm-1");
      await expect(page.getByRole("heading", { level: 1, name: "Ultimate Code Review Assistant" })).toBeVisible();
    });
  });

  test("copy prompt button toggles state", async ({ page, logger }) => {
    const copyButton = page.getByRole("button").filter({ hasText: "Copy Prompt" }).first();

    await logger.step("click copy prompt", async () => {
      await copyButton.click();
    });

    await logger.step("verify copied state", async () => {
      await expect(page.getByRole("button").filter({ hasText: "Copied!" }).first()).toBeVisible();
    });
  });

  test("rating buttons toggle selection", async ({ page, logger }) => {
    const helpfulButton = page.getByRole("button", { name: "Yes, helpful" });
    const notHelpfulButton = page.getByRole("button", { name: "Not helpful" });

    await logger.step("mark as helpful", async () => {
      await helpfulButton.click();
      await expect(helpfulButton).toHaveClass(/bg-emerald-600/);
    });

    await logger.step("switch to not helpful", async () => {
      await notHelpfulButton.click();
      await expect(notHelpfulButton).toHaveClass(/bg-red-600/);
    });
  });

  test("action buttons are present", async ({ page, logger }) => {
    await logger.step("verify action buttons", async () => {
      await expect(page.getByRole("button").filter({ hasText: "Save to Library" }).first()).toBeVisible();
      await expect(page.getByRole("button").filter({ hasText: "Fork & Edit" }).first()).toBeVisible();
      await expect(page.getByRole("button").filter({ hasText: "Share" }).first()).toBeVisible();
    });
  });

  test("report action is available", async ({ page, logger }) => {
    await logger.step("verify report button", async () => {
      await expect(page.getByRole("button", { name: "Report" })).toBeVisible();
    });
  });
});
