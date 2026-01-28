/**
 * Console Health Check Tests
 *
 * These tests verify that key pages load without console errors.
 * They catch invisible bugs like:
 * - Hydration mismatches (SSR/client differences)
 * - Network failures
 * - React warnings
 * - Security violations
 *
 * Run with: bunx playwright test --config e2e/playwright.config.ts e2e/web/console-health.spec.ts
 */

import { test, expect } from "../fixtures/pages";

/**
 * Pages to check for console health.
 * Add new pages here as they're created.
 */
const PAGES_TO_CHECK = [
  { path: "/", name: "Homepage" },
  { path: "/bundles", name: "Bundles" },
  { path: "/pricing", name: "Pricing" },
  { path: "/help", name: "Help" },
  { path: "/contact", name: "Contact" },
  { path: "/terms", name: "Terms" },
  { path: "/privacy", name: "Privacy" },
  { path: "/changelog", name: "Changelog" },
  { path: "/workflows", name: "Workflows" },
  { path: "/swap-meet", name: "Swap Meet" },
  { path: "/roadmap", name: "Roadmap" },
  { path: "/referrals", name: "Referrals" },
];

test.describe("Console Health - Critical Pages", () => {
  for (const { path, name } of PAGES_TO_CHECK) {
    test(`${name} (${path}) - no console errors`, async ({ page, sharedConsoleMonitor }) => {
      // Clear any previous messages
      sharedConsoleMonitor.clear();

      // Navigate to page
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Check for errors
      const errors = sharedConsoleMonitor.getUnexpectedErrors();

      if (errors.length > 0) {
        console.error(`\n❌ Console errors on ${name} (${path}):`);
        sharedConsoleMonitor.printErrors();
      }

      expect(errors, `${name} should have no unexpected console errors`).toHaveLength(0);
    });

    test(`${name} (${path}) - no hydration errors`, async ({ page, sharedConsoleMonitor }) => {
      // Clear any previous messages
      sharedConsoleMonitor.clear();

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const hydrationErrors = sharedConsoleMonitor.getErrors("hydration");

      if (hydrationErrors.length > 0) {
        console.error(`\n⚠️ Hydration errors on ${name} (${path}):`);
        for (const error of hydrationErrors) {
          console.error(`  - ${error.text.slice(0, 200)}`);
        }
      }

      expect(hydrationErrors, `${name} should have no hydration errors`).toHaveLength(0);
    });
  }
});

test.describe("Console Health - Prompt Detail Pages", () => {
  test("sample prompt page - no console errors", async ({ page, sharedConsoleMonitor }) => {
    // Clear any previous messages
    sharedConsoleMonitor.clear();

    // Navigate to homepage first to get a prompt link
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find first View button and click it
    const viewButton = page.getByRole("button", { name: /view/i }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForLoadState("networkidle");

      const errors = sharedConsoleMonitor.getUnexpectedErrors();
      expect(errors).toHaveLength(0);
    }
  });
});

test.describe("Console Health - Mobile Viewports", () => {
  const MOBILE_VIEWPORT = { width: 390, height: 844 };

  for (const { path, name } of PAGES_TO_CHECK.slice(0, 5)) {
    // Test first 5 pages on mobile
    test(`${name} (${path}) mobile - no console errors`, async ({ page, sharedConsoleMonitor }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);

      // Clear any previous messages
      sharedConsoleMonitor.clear();

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const errors = sharedConsoleMonitor.getUnexpectedErrors();
      expect(errors, `${name} mobile should have no console errors`).toHaveLength(0);
    });
  }
});

test.describe("Console Health - Summary Report", () => {
  test("generate console health summary", async ({ page, sharedConsoleMonitor }, testInfo) => {
    const results: Array<{
      page: string;
      path: string;
      errors: number;
      warnings: number;
      hydration: number;
      network: number;
      react: number;
    }> = [];

    for (const { path, name } of PAGES_TO_CHECK) {
      // Clear for each page
      sharedConsoleMonitor.clear();

      try {
        await page.goto(path, { timeout: 30000 });
        await page.waitForLoadState("networkidle");

        const summary = sharedConsoleMonitor.getSummary();
        results.push({
          page: name,
          path,
          errors:
            summary.runtime.errors +
            summary.network.errors +
            summary.hydration.errors +
            summary.security.errors,
          warnings:
            summary.runtime.warnings +
            summary.network.warnings +
            summary.react.warnings +
            summary.deprecation.warnings,
          hydration: summary.hydration.errors,
          network: summary.network.errors,
          react: summary.react.warnings,
        });
      } catch (error) {
        results.push({
          page: name,
          path,
          errors: -1, // Navigation failed
          warnings: -1,
          hydration: -1,
          network: -1,
          react: -1,
        });
      }
    }

    // Attach summary report
    const report = {
      timestamp: new Date().toISOString(),
      totalPages: results.length,
      pagesWithErrors: results.filter((r) => r.errors > 0).length,
      pagesWithHydrationIssues: results.filter((r) => r.hydration > 0).length,
      details: results,
    };

    await testInfo.attach("console-health-report", {
      body: JSON.stringify(report, null, 2),
      contentType: "application/json",
    });

    // Log summary
    console.log("\n=== Console Health Summary ===");
    console.log(`Pages checked: ${results.length}`);
    console.log(`Pages with errors: ${results.filter((r) => r.errors > 0).length}`);
    console.log(`Pages with hydration issues: ${results.filter((r) => r.hydration > 0).length}`);
    console.log("==============================\n");

    // Table output
    console.table(
      results.map((r) => ({
        Page: r.page,
        Errors: r.errors === -1 ? "FAIL" : r.errors,
        Warnings: r.warnings === -1 ? "FAIL" : r.warnings,
        Hydration: r.hydration === -1 ? "FAIL" : r.hydration,
      }))
    );

    // Assert no critical issues
    const criticalIssues = results.filter((r) => r.hydration > 0 || r.errors === -1);
    expect(criticalIssues, "No pages should have hydration errors or fail to load").toHaveLength(0);
  });
});
