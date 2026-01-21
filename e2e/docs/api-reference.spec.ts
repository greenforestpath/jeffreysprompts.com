import { test, expect } from "../lib/playwright-logger";

const DOCS_URL = "/docs/api";

test.describe("API Docs - Reference Content", () => {
  test("renders key sections and endpoints", async ({ page, logger }) => {
    await logger.step("navigate to API docs", async () => {
      await page.goto(DOCS_URL, { waitUntil: "networkidle" });
    });

    const headings = [
      "Prompts",
      "Skills",
      "Share Links",
      "Health Endpoints",
      "Error Handling",
      "Rate Limits",
    ];

    for (const heading of headings) {
      await logger.step(`verify section heading: ${heading}`, async () => {
        await expect(page.getByRole("heading", { name: heading, level: 2 })).toBeVisible();
      });
    }

    const endpointSnippets = [
      { text: "GET /prompts", scope: "#prompts" },
      { text: "GET /skills/:id", scope: "#skills" },
      { text: "POST /share", scope: "#share" },
      { text: "GET /share/:code", scope: "#share" },
      { text: "GET /health", scope: "#health" },
    ];

    for (const endpoint of endpointSnippets) {
      await logger.step(`verify endpoint snippet: ${endpoint.text}`, async () => {
        const scope = page.locator(endpoint.scope);
        await expect(scope).toBeVisible();
        await expect(scope.locator("code", { hasText: endpoint.text }).first()).toBeVisible();
      });
    }
  });

  test("documents error responses and rate limits", async ({ page, logger }) => {
    await logger.step("navigate to API docs", async () => {
      await page.goto(DOCS_URL, { waitUntil: "networkidle" });
    });

    await logger.step("verify error response example", async () => {
      const errorSection = page.locator("#errors");
      await expect(errorSection).toBeVisible();
      await expect(errorSection.locator("code", { hasText: "\"error\":" }).first()).toBeVisible();
    });

    await logger.step("verify HTTP status codes table includes 401", async () => {
      const row = page.locator("tr", { hasText: "401" });
      await expect(row).toBeVisible();
      await expect(row).toContainText("Unauthorized");
    });

    await logger.step("verify rate limit example includes Retry-After", async () => {
      const rateLimitSection = page.locator("#rate-limits");
      await expect(rateLimitSection).toBeVisible();
      await expect(rateLimitSection.locator("code", { hasText: "Retry-After" }).first()).toBeVisible();
    });
  });
});
