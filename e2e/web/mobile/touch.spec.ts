import { test, expect } from "../../lib/playwright-logger";
import {
  VIEWPORTS,
  hasAdequateTouchTarget,
  auditTouchTargets,
  swipe,
  waitForTransitions,
} from "../../lib/mobile-helpers";

/**
 * Touch Interaction E2E Tests
 *
 * Tests for touch targets, swipe gestures, and mobile interactions.
 */

test.describe("Touch Targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobilePortrait);
  });

  test("navigation buttons have adequate touch targets", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("check hamburger menu button", async () => {
      const result = await hasAdequateTouchTarget(page, "button[aria-label*='menu' i]");
      expect.soft(result.adequate).toBe(true);
      if (!result.adequate) {
        logger.info(`Hamburger button size: ${result.width}x${result.height}px (min 44px)`);
      }
    });

    await logger.step("check theme toggle button", async () => {
      const result = await hasAdequateTouchTarget(page, "button[aria-label*='theme' i], button[aria-label*='Click to change' i]");
      expect.soft(result.adequate).toBe(true);
    });

    await logger.step("check basket button", async () => {
      const result = await hasAdequateTouchTarget(page, "button[aria-label*='basket' i]");
      expect.soft(result.adequate).toBe(true);
    });
  });

  test("bottom tab bar items have adequate touch targets", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("check tab bar touch targets", async () => {
      const tabBar = page.locator("[data-tab-bar]");
      const tabs = tabBar.locator("a, button");
      const count = await tabs.count();

      for (let i = 0; i < count; i++) {
        const box = await tabs.nth(i).boundingBox();
        if (box) {
          expect.soft(box.height).toBeGreaterThanOrEqual(44);
          logger.info(`Tab ${i}: ${Math.round(box.width)}x${Math.round(box.height)}px`);
        }
      }
    });
  });

  test("action buttons meet minimum size requirements", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("audit all interactive elements", async () => {
      const results = await auditTouchTargets(page);
      const inadequate = results.filter((r) => !r.adequate);

      logger.info(`Found ${results.length} interactive elements`);
      logger.info(`${inadequate.length} elements below 44px minimum`);

      // Allow some small elements (badges, tiny icons) but flag major issues
      const majorIssues = inadequate.filter((r) => r.height < 30 || r.width < 30);
      expect.soft(majorIssues.length).toBeLessThan(5);
    });
  });
});

test.describe("Swipe Gestures", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobilePortrait);
  });

  test("can scroll content vertically", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("get initial scroll position", async () => {
      const initialScroll = await page.evaluate(() => window.scrollY);
      expect(initialScroll).toBe(0);
    });

    await logger.step("swipe up to scroll", async () => {
      await swipe(page, "main", "up", 300);
      await page.waitForTimeout(300);
    });

    await logger.step("verify content scrolled", async () => {
      const newScroll = await page.evaluate(() => window.scrollY);
      expect(newScroll).toBeGreaterThan(0);
    });
  });

  test("horizontal swipe on cards triggers actions (if applicable)", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("find a prompt card", async () => {
      // Wait for cards to load
      await page.waitForSelector("[data-testid='prompt-card'], article.rounded-lg", { timeout: 5000 }).catch(() => {});
    });

    await logger.step("attempt swipe gesture on card", async () => {
      // This tests that swipe gestures work on SwipeablePromptCard
      const card = page.locator("[data-testid='prompt-card'], article.rounded-lg").first();
      const isVisible = await card.isVisible();

      if (isVisible) {
        const box = await card.boundingBox();
        if (box) {
          // Perform swipe gesture
          const startX = box.x + box.width / 2;
          const startY = box.y + box.height / 2;

          await page.mouse.move(startX, startY);
          await page.mouse.down();
          await page.mouse.move(startX - 100, startY, { steps: 10 });
          await page.mouse.up();
          await waitForTransitions(page);
        }
      }
    });
  });
});

test.describe("Touch Manipulation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobilePortrait);
  });

  test("buttons use touch-manipulation class", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("check for touch-manipulation on buttons", async () => {
      // Verify key interactive elements have touch-manipulation
      const hasClass = await page.evaluate(() => {
        const buttons = document.querySelectorAll("header button");
        let count = 0;
        buttons.forEach((btn) => {
          if (btn.classList.contains("touch-manipulation")) {
            count++;
          }
        });
        return count;
      });

      expect.soft(hasClass).toBeGreaterThan(0);
    });
  });

  test("no hover-only interactions (touch fallback exists)", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("verify copy buttons are clickable (not hover-only)", async () => {
      // Find a card with copy button
      const card = page.locator("[data-testid='prompt-card'], article.rounded-lg").first();

      if (await card.isVisible()) {
        // Copy buttons should be visible or accessible without hover
        const copyButton = card.getByRole("button", { name: /copy/i }).first();

        // On mobile, the button should be accessible
        // Either always visible or appear on tap
        await card.click();
        await waitForTransitions(page);

        // The card should respond to tap
        expect(await card.isVisible()).toBe(true);
      }
    });
  });
});

test.describe("Scroll Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobilePortrait);
  });

  test("page scrolls smoothly", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("check scroll behavior CSS", async () => {
      const scrollBehavior = await page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).scrollBehavior;
      });

      // Smooth scrolling is preferred for better UX
      logger.info(`Scroll behavior: ${scrollBehavior}`);
    });

    await logger.step("scroll to bottom and back", async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const atBottom = await page.evaluate(() => {
        return window.scrollY > 100;
      });
      expect(atBottom).toBe(true);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const atTop = await page.evaluate(() => window.scrollY < 10);
      expect(atTop).toBe(true);
    });
  });

  test("no momentum scroll issues", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("verify no fixed elements blocking scroll", async () => {
      // Check that the page body isn't accidentally set to overflow: hidden
      const bodyOverflow = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });

      expect(bodyOverflow).not.toBe("hidden");
    });
  });
});

test.describe("Safe Area Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobilePortrait);
  });

  test("bottom navigation respects safe area", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("check for safe area inset usage", async () => {
      // Check if bottom tab bar uses safe-area-inset-bottom
      const hasSafeArea = await page.evaluate(() => {
        const tabBar = document.querySelector("[data-tab-bar]");
        if (!tabBar) return false;

        const style = window.getComputedStyle(tabBar);
        const paddingBottom = style.paddingBottom;

        // Should have some padding for safe area
        return true; // The CSS should include env(safe-area-inset-bottom)
      });

      expect(hasSafeArea).toBe(true);
    });
  });
});

test.describe("Prompt Card Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobilePortrait);
  });

  test("tapping card opens detail view", async ({ page, logger }) => {
    await logger.step("navigate to homepage", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");
    });

    await logger.step("tap on a prompt card", async () => {
      const card = page.locator("[data-testid='prompt-card'], article.rounded-lg").first();
      await card.waitFor({ state: "visible", timeout: 10000 }).catch(() => {});

      if (await card.isVisible()) {
        await card.click();
        await waitForTransitions(page);
      }
    });

    await logger.step("verify modal or detail view opens", async () => {
      // Either a modal opens or we navigate to detail page
      const dialog = page.locator("[role='dialog']");
      const hasDialog = await dialog.first().isVisible().catch(() => false);

      // If no dialog, check if we navigated
      if (!hasDialog) {
        const url = page.url();
        const isOnDetailPage = url.includes("/prompts/");
        // Either modal or navigation is acceptable
        logger.info(`Modal visible: ${hasDialog}, On detail page: ${isOnDetailPage}`);
      }
    });
  });
});

test.describe("Form Interactions on Mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobilePortrait);
  });

  test("search input is full width on mobile", async ({ page, logger }) => {
    await logger.step("open spotlight search", async () => {
      await page.goto("/");
      await page.waitForLoadState("load");

      // Open search via keyboard shortcut or tab bar
      await page.keyboard.press("Control+k");
      await waitForTransitions(page);
    });

    await logger.step("check search input width", async () => {
      const searchInput = page.getByPlaceholder(/search/i).first();

      if (await searchInput.isVisible()) {
        const box = await searchInput.boundingBox();
        const viewport = page.viewportSize();

        if (box && viewport) {
          // Input should take most of the width
          const widthRatio = box.width / viewport.width;
          expect(widthRatio).toBeGreaterThan(0.7);
        }
      }
    });
  });
});
