import { test, expect } from "../lib/playwright-logger";
import type { Page } from "@playwright/test";
import type { PlaywrightLogger } from "../lib/playwright-logger";

const DOCS_URL = "/docs/api";

async function openDocs(page: Page, logger: PlaywrightLogger) {
  await logger.step("navigate to API docs", async () => {
    await page.goto(DOCS_URL, { waitUntil: "networkidle" });
  });
}

async function openMobileTocIfVisible(page: Page, logger: PlaywrightLogger) {
  const tocDetails = page.locator("details", { hasText: "Table of Contents" });
  if (await tocDetails.isVisible()) {
    await logger.step("open mobile TOC", async () => {
      const summary = tocDetails.locator("summary");
      const isOpen = (await tocDetails.getAttribute("open")) !== null;
      if (!isOpen) {
        await summary.click();
      }
    });
  }
}

async function findVisibleNavLink(page: Page, hrefs: string[]) {
  for (const href of hrefs) {
    const link = page.locator(`a[href="${href}"]`).first();
    if (await link.isVisible()) {
      return link;
    }
  }
  return page.locator(`a[href="${hrefs[0]}"]`).first();
}

test.describe("API Docs - Navigation", () => {
  test("renders navigation for desktop and mobile", async ({ page, logger }) => {
    await openDocs(page, logger);

    await logger.step("verify page title heading", async () => {
      await expect(page.getByRole("heading", { name: "API Documentation" })).toBeVisible();
    });

    const viewport = page.viewportSize();
    const isMobile = Boolean(viewport && viewport.width < 900);

    if (isMobile) {
      await openMobileTocIfVisible(page, logger);
      await logger.step("verify mobile TOC is visible", async () => {
        await expect(page.locator("details", { hasText: "Table of Contents" })).toBeVisible();
      });
    } else {
      await logger.step("verify desktop navigation is visible", async () => {
        await expect(page.getByRole("heading", { name: "API Reference" })).toBeVisible();
      });
    }

    await openMobileTocIfVisible(page, logger);

    const navLinks = [
      { hrefs: ["#prompts", "/docs/api#prompts"], label: "Prompts" },
      { hrefs: ["#skills", "/docs/api#skills"], label: "Skills" },
      { hrefs: ["#share", "/docs/api#share"], label: "Share Links" },
      { hrefs: ["#health", "/docs/api#health"], label: "Health Endpoints" },
    ];

    for (const { hrefs, label } of navLinks) {
      await logger.step(`verify nav link ${label}`, async () => {
        const link = await findVisibleNavLink(page, hrefs);
        await expect(link).toBeVisible();
      });
    }
  });

  test("TOC links update the URL hash and focus sections", async ({ page, logger }) => {
    await openDocs(page, logger);
    await openMobileTocIfVisible(page, logger);

    await logger.step("click Authentication in TOC", async () => {
      const internalLink = page.locator('a[href="#authentication"]').first();
      if (await internalLink.isVisible()) {
        await internalLink.click();
        return;
      }
      const fullLink = page.locator('a[href="/docs/api#authentication"]').first();
      await fullLink.click();
    });

    await logger.step("verify URL hash updates", async () => {
      await expect(page).toHaveURL(/#authentication/);
    });

    await logger.step("verify Authentication section is visible", async () => {
      await expect(page.locator("#authentication")).toBeVisible();
    });
  });
});
