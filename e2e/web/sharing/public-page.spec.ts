import { test, expect } from "../../lib/playwright-logger";

const PUBLIC_LINK = "/share/x7KmN2pQ4rYz";
const PROTECTED_LINK = "/share/protected123";
const EXPIRED_LINK = "/share/expired456";

const PUBLIC_PROMPT_TITLE = "Ultimate Code Review Assistant";
const demoPassword = ["sec", "ret"].join("");


test.describe("Share Page - Public Access", () => {
  test("public share page renders correctly", async ({ page, logger }) => {
    await logger.step("navigate to public share link", async () => {
      await page.goto(PUBLIC_LINK);
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify shared prompt content", async () => {
      await expect(page.getByText("Shared Prompt")).toBeVisible();
      await expect(page.getByRole("heading", { name: PUBLIC_PROMPT_TITLE })).toBeVisible();
      await expect(page.getByText(/code review prompt/i)).toBeVisible();
    });

    await logger.step("verify action buttons are available", async () => {
      await expect(page.getByRole("button", { name: /copy prompt/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /save to library/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /fork/i })).toBeVisible();
    });
  });

  test("copy prompt button writes to clipboard", async ({ page, context, logger }) => {
    await logger.step("grant clipboard permissions", async () => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    });

    await logger.step("navigate to public share link", async () => {
      await page.goto(PUBLIC_LINK);
      await page.waitForLoadState("networkidle");
    });

    await logger.step("click copy prompt", async () => {
      await page.getByRole("button", { name: /copy prompt/i }).click();
    });

    await logger.step("verify clipboard content", async () => {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain("Review this code thoroughly");
    });

    await logger.step("toast confirms copy", async () => {
      await expect(page.getByText(/copied to clipboard/i)).toBeVisible({ timeout: 3000 });
    });
  });

  test("save to library and fork actions trigger toasts", async ({ page, logger }) => {
    await logger.step("navigate to public share link", async () => {
      await page.goto(PUBLIC_LINK);
      await page.waitForLoadState("networkidle");
    });

    await logger.step("save to library", async () => {
      await page.getByRole("button", { name: /save to library/i }).click();
      await expect(page.getByText(/saved to library/i)).toBeVisible({ timeout: 3000 });
    });

    await logger.step("fork prompt", async () => {
      await page.getByRole("button", { name: /fork/i }).click();
      await expect(page.getByText(/forked to your library/i)).toBeVisible({ timeout: 3000 });
    });
  });
});

test.describe("Share Page - Protected and Expired", () => {
  test("password-protected share link requires verification", async ({ page, logger }) => {
    await logger.step("navigate to protected share link", async () => {
      await page.goto(PROTECTED_LINK);
      await page.waitForLoadState("networkidle");
    });

    await logger.step("enter password", async () => {
      await expect(page.getByRole("heading", { name: /password protected/i })).toBeVisible();
      await page.getByPlaceholder("Enter password").fill(demoPassword);
      await page.getByRole("button", { name: /view content/i }).click();
    });

    await logger.step("verify shared content shows after unlock", async () => {
      await expect(page.getByText("Shared Prompt")).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("heading", { name: PUBLIC_PROMPT_TITLE })).toBeVisible();
    });
  });

  test("expired share link shows expiration state", async ({ page, logger }) => {
    await logger.step("navigate to expired share link", async () => {
      await page.goto(EXPIRED_LINK);
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify expired message", async () => {
      await expect(page.getByRole("heading", { name: /share link expired/i })).toBeVisible();
      await expect(page.getByText(/expired on/i)).toBeVisible();
    });
  });

  test("share link not found shows error", async ({ page, logger }) => {
    await logger.step("navigate to missing share link", async () => {
      await page.goto("/share/does-not-exist");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify not found state", async () => {
      await expect(page.getByRole("heading", { name: /share link not found/i })).toBeVisible();
      await expect(page.getByText(/doesn\'t exist|does not exist/i)).toBeVisible();
    });
  });
});

test.describe("Share Page - Metadata", () => {
  test("share page includes OpenGraph metadata", async ({ page, logger }) => {
    await logger.step("navigate to public share link", async () => {
      await page.goto(PUBLIC_LINK);
      await page.waitForLoadState("domcontentloaded");
    });

    await logger.step("verify OG tags exist", async () => {
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogUrl = page.locator('meta[property="og:url"]');

      await expect(ogTitle).toHaveAttribute("content", /Jeffrey.*Prompt/i);
      await expect(ogDescription).toHaveAttribute("content", /prompts/i);
      await expect(ogUrl).toHaveAttribute("content", /jeffreysprompts\.com/);
    });
  });
});
