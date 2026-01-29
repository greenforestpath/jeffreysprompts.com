/**
 * Playwright Production Testing Configuration
 *
 * Use this config to test against the live production site.
 * Optimized for:
 * - Longer timeouts (real network latency)
 * - Full tracing on failure
 * - Video capture for debugging
 * - Multiple device viewports
 *
 * Usage:
 *   # Test against production
 *   bun run test:e2e:prod
 *
 *   # With specific test file
 *   bunx playwright test --config e2e/playwright.production.config.ts e2e/web/homepage.spec.ts
 *
 *   # With headed browser for debugging
 *   bunx playwright test --config e2e/playwright.production.config.ts --headed
 */

import { defineConfig, devices } from "@playwright/test";

// Production URLs
const PRODUCTION_URL = "https://jeffreysprompts.com";
const PRO_URL = "https://pro.jeffreysprompts.com";

export default defineConfig({
  testDir: ".",
  testMatch: [
    "web/**/*.spec.ts",
    "swapmeet/**/*.spec.ts",
    "docs/**/*.spec.ts",
    "ratings/**/*.spec.ts",
    "discovery/**/*.spec.ts",
    "referral/**/*.spec.ts",
    "roadmap/**/*.spec.ts",
    "comments/**/*.spec.ts",
    "social/**/*.spec.ts",
    "admin/**/*.spec.ts",
    "history/**/*.spec.ts",
  ],

  // Production needs more generous timeouts
  timeout: 60000,
  expect: {
    timeout: 15000,
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail on test.only in CI
  forbidOnly: !!process.env.CI,

  // Retry failed tests
  retries: process.env.CI ? 2 : 1,

  // Workers
  workers: process.env.CI ? 2 : 4,

  // Rich reporting
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report-production" }],
    ["list"],
    ["json", { outputFile: "test-results/production-results.json" }],
  ],

  use: {
    // Production base URL
    baseURL: process.env.E2E_PROD_URL || PRODUCTION_URL,

    // Capture everything on failure for debugging
    trace: "retain-on-failure",
    screenshot: "on",
    video: "retain-on-failure",

    // Production-appropriate timeouts
    actionTimeout: 30000,
    navigationTimeout: 60000,

    // Realistic browser behavior
    bypassCSP: false,
    ignoreHTTPSErrors: false,

    // Extra headers for identification
    extraHTTPHeaders: {
      "X-E2E-Test": "true",
      "X-Test-Source": "playwright-production",
    },
  },

  projects: [
    // Desktop Chrome - Primary
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },

    // Desktop Chrome - Large Screen
    {
      name: "Desktop Chrome Large",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile Chrome - Primary mobile
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },

    // Mobile Safari - iOS testing
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
      },
    },

    // Tablet
    {
      name: "Tablet",
      use: {
        ...devices["iPad (gen 7)"],
      },
    },

    // Desktop Firefox - Cross-browser
    {
      name: "Desktop Firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
  ],

  // No local server for production tests
  // We're testing the live site
});
