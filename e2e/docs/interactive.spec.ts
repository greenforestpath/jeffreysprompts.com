import { test, expect } from "../lib/playwright-logger";

const DOCS_URL = "/docs/api";
const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3001";

test.describe("API Docs - Interactive Features", () => {
  test("code tabs switch languages and update content", async ({ page, logger }) => {
    await logger.step("navigate to API docs", async () => {
      await page.goto(DOCS_URL, { waitUntil: "networkidle" });
    });

    await logger.step("select Python tab", async () => {
      await page.getByRole("button", { name: "Python" }).click();
    });

    await logger.step("verify Python snippet is visible", async () => {
      await expect(page.locator("code", { hasText: "requests.get" })).toBeVisible();
    });

    await logger.step("select JavaScript tab", async () => {
      await page.getByRole("button", { name: "JavaScript" }).click();
    });

    await logger.step("verify JavaScript snippet is visible", async () => {
      await expect(page.locator("code", { hasText: "fetch('https://jeffreysprompts.com/api/prompts" })).toBeVisible();
    });
  });

  test("copy buttons and OpenAPI link work", async ({ page, logger }) => {
    await logger.step("stub clipboard API", async () => {
      await page.addInitScript(() => {
        (window as unknown as { __copied: boolean }).__copied = false;
        Object.defineProperty(navigator, "clipboard", {
          value: {
            writeText: async () => {
              (window as unknown as { __copied: boolean }).__copied = true;
            },
          },
          configurable: true,
        });
      });
    });

    await logger.step("navigate to API docs", async () => {
      await page.goto(DOCS_URL, { waitUntil: "networkidle" });
    });

    await logger.step("grant clipboard permissions", async () => {
      await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
        origin: BASE_URL,
      });
    });

    await logger.step("click first copy button", async () => {
      const copyButton = page.getByRole("button", { name: "Copy code" }).first();
      await copyButton.click();
      await expect.poll(async () => {
        return page.evaluate(() => (window as unknown as { __copied: boolean }).__copied);
      }).toBe(true);
    });

    await logger.step("open OpenAPI spec in new tab", async () => {
      const [specPage] = await Promise.all([
        page.context().waitForEvent("page"),
        page.getByRole("link", { name: "OpenAPI Spec" }).first().click(),
      ]);
      await specPage.waitForLoadState("domcontentloaded");
      await expect(specPage).toHaveURL(/\/openapi\.json$/);
      await specPage.close();
    });

    await logger.step("verify OpenAPI spec returns JSON", async () => {
      const response = await page.request.get("/openapi.json");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.openapi).toBeDefined();
    });
  });
});
