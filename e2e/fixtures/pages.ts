/**
 * Page Object Fixtures for Playwright
 *
 * Extends Playwright's test fixture system to inject Page Objects.
 * This allows tests to receive pre-configured page objects:
 *
 * Usage:
 *   import { test, expect } from "../fixtures/pages";
 *
 *   test("homepage loads", async ({ homePage }) => {
 *     await homePage.goto();
 *     expect(await homePage.getPromptCardCount()).toBeGreaterThan(0);
 *   });
 */

import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { PromptDetailPage } from "../pages/PromptDetailPage";
import { PricingPage } from "../pages/PricingPage";
import { ConsoleMonitor } from "../utils/console-monitor";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

type PageFixtures = {
  /**
   * Shared ConsoleMonitor instance.
   * This is created FIRST and shared with all Page Objects.
   */
  sharedConsoleMonitor: ConsoleMonitor;
  homePage: HomePage;
  promptDetailPage: PromptDetailPage;
  pricingPage: PricingPage;
  /** @deprecated Use homePage.getUnexpectedErrors() or sharedConsoleMonitor directly */
  consoleMonitor: ConsoleMonitor;
  assertNoConsoleErrors: () => Promise<void>;
};

export const test = base.extend<PageFixtures>({
  // Create the shared monitor FIRST - this is the single source of truth
  sharedConsoleMonitor: async ({ page }, use) => {
    const monitor = new ConsoleMonitor(page);
    await use(monitor);
  },

  // Page Objects now receive the shared monitor
  homePage: async ({ page, sharedConsoleMonitor }, use, testInfo) => {
    const homePage = new HomePage(page, testInfo, sharedConsoleMonitor);
    await use(homePage);
  },

  promptDetailPage: async ({ page, sharedConsoleMonitor }, use, testInfo) => {
    const promptDetailPage = new PromptDetailPage(page, testInfo, sharedConsoleMonitor);
    await use(promptDetailPage);
  },

  pricingPage: async ({ page, sharedConsoleMonitor }, use, testInfo) => {
    const pricingPage = new PricingPage(page, testInfo, sharedConsoleMonitor);
    await use(pricingPage);
  },

  // Alias for backwards compatibility
  consoleMonitor: async ({ sharedConsoleMonitor }, use) => {
    await use(sharedConsoleMonitor);
  },

  assertNoConsoleErrors: async ({ page, sharedConsoleMonitor }, use, testInfo) => {
    const assertFn = async () => {
      const errors = sharedConsoleMonitor.getUnexpectedErrors();

      if (errors.length > 0) {
        console.error("\n=== Unexpected Console Errors ===");
        sharedConsoleMonitor.printErrors();
        console.error("=================================\n");

        // Ensure screenshot directory exists
        const screenshotDir = join(testInfo.outputDir, "screenshots");
        if (!existsSync(screenshotDir)) {
          mkdirSync(screenshotDir, { recursive: true });
        }

        // Take screenshot for debugging
        const screenshotPath = join(screenshotDir, `console-errors-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        await testInfo.attach("console-errors-screenshot", {
          path: screenshotPath,
          contentType: "image/png",
        });

        // Attach console log
        await testInfo.attach("console-log", {
          body: sharedConsoleMonitor.toJSON(),
          contentType: "application/json",
        });

        throw new Error(`Found ${errors.length} unexpected console errors. Check attached logs.`);
      }
    };

    await use(assertFn);
  },
});

export { expect } from "@playwright/test";

/**
 * Auto-attach console summary to every test.
 * This runs after each test to log console activity.
 */
test.afterEach(async ({ sharedConsoleMonitor }, testInfo) => {
  const summary = sharedConsoleMonitor.getSummary();

  // Always attach summary for debugging
  testInfo.annotations.push({
    type: "console-summary",
    description: JSON.stringify(summary),
  });

  // Log warning if there were any issues
  const hasIssues =
    summary.hydration.errors > 0 ||
    summary.runtime.errors > 0 ||
    summary.network.errors > 0;

  if (hasIssues) {
    console.warn(`\n⚠️ Console issues detected in "${testInfo.title}":`);
    if (summary.hydration.errors > 0) {
      console.warn(`  - ${summary.hydration.errors} hydration error(s)`);
    }
    if (summary.runtime.errors > 0) {
      console.warn(`  - ${summary.runtime.errors} runtime error(s)`);
    }
    if (summary.network.errors > 0) {
      console.warn(`  - ${summary.network.errors} network error(s)`);
    }
  }

  // Attach full log on failure
  if (testInfo.status !== "passed") {
    const allMessages = sharedConsoleMonitor.getAll();
    if (allMessages.length > 0) {
      await testInfo.attach("console-log-full", {
        body: JSON.stringify(allMessages, null, 2),
        contentType: "application/json",
      });
    }
  }
});

export default test;
