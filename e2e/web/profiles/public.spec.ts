import { test, expect } from "../../lib/playwright-logger";
import {
  navigateToProfile,
  getDisplayName,
  getUsername,
  getBio,
  hasAvatar,
  hasJoinDate,
  getProfileTabs,
  clickProfileTab,
  getTabContentCards,
  hasEmptyState,
  getShareButton,
  getSocialLinks,
  TEST_USERS,
} from "../../lib/profile-helpers";

/**
 * Public Profile Page E2E Tests
 *
 * Tests for public user profile display including:
 * 1. Profile page loads for existing users
 * 2. Avatar, bio, username display
 * 3. Public prompts listed
 * 4. Collections/packs shown
 * 5. Join date shown
 * 6. Social links display
 */

test.describe("Public Profile Page Load", () => {
  test("profile page loads for existing user", async ({ page, logger }) => {
    await logger.step("navigate to jeffreyemanuel profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify page loads without error", async () => {
      await expect(page).toHaveURL(/\/user\/jeffreyemanuel/);
    });

    await logger.step("verify display name shows", async () => {
      const displayName = await getDisplayName(page);
      expect(displayName).toBe("Jeffrey Emanuel");
    });
  });

  test("profile page shows 404 for non-existent user", async ({ page, logger }) => {
    await logger.step("navigate to non-existent user", async () => {
      const response = await page.goto("/user/this_user_does_not_exist_12345");
      // Should return 404 or redirect to not-found page
      const status = response?.status();
      expect(status === 404 || page.url().includes("not-found")).toBeTruthy();
    });
  });

  test("profile page handles invalid username format", async ({ page, logger }) => {
    await logger.step("try invalid username with special chars", async () => {
      const response = await page.goto("/user/invalid@user!");
      // Should return 404 or show not-found
      const status = response?.status();
      expect(status === 404 || page.url().includes("not-found")).toBeTruthy();
    });
  });
});

test.describe("Profile Header Display", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to jeffreyemanuel profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });
  });

  test("displays avatar or initials placeholder", async ({ page, logger }) => {
    await logger.step("verify avatar section exists", async () => {
      const hasAvatarElement = await hasAvatar(page);
      expect(hasAvatarElement).toBe(true);
    });

    await logger.step("verify avatar is visible", async () => {
      // Check for either an image or initials div
      const avatar = page.locator("img[alt], div.rounded-full").first();
      await expect(avatar).toBeVisible();
    });
  });

  test("displays display name and username", async ({ page, logger }) => {
    await logger.step("verify display name", async () => {
      const displayName = await getDisplayName(page);
      expect(displayName).toBe("Jeffrey Emanuel");
    });

    await logger.step("verify username with @ prefix", async () => {
      await expect(page.getByText("@jeffreyemanuel")).toBeVisible();
    });
  });

  test("displays bio when available", async ({ page, logger }) => {
    await logger.step("verify bio is displayed", async () => {
      const bio = await getBio(page);
      expect(bio).toBeTruthy();
      expect(bio).toContain("Creator of JeffreysPrompts");
    });
  });

  test("displays join date", async ({ page, logger }) => {
    await logger.step("verify join date section exists", async () => {
      const hasDate = await hasJoinDate(page);
      expect(hasDate).toBe(true);
    });

    await logger.step("verify join date format", async () => {
      // Should show "Member since Jan 2024" or similar
      await expect(page.getByText(/Member since/i)).toBeVisible();
    });
  });

  test("displays location when available", async ({ page, logger }) => {
    await logger.step("verify location is shown for jeffreyemanuel", async () => {
      // jeffreyemanuel has location: "San Francisco, CA"
      await expect(page.getByText("San Francisco, CA")).toBeVisible();
    });
  });

  test("displays social links", async ({ page, logger }) => {
    await logger.step("verify Twitter link", async () => {
      const links = await getSocialLinks(page);
      expect(links.twitter).toContain("twitter.com/doodlestein");
    });

    await logger.step("verify GitHub link", async () => {
      const links = await getSocialLinks(page);
      expect(links.github).toContain("github.com/jeffreyemanuel");
    });

    await logger.step("verify Website link", async () => {
      await expect(page.getByText("Website")).toBeVisible();
    });
  });
});

test.describe("Profile Actions", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });
  });

  test("share button is visible", async ({ page, logger }) => {
    await logger.step("verify share button exists", async () => {
      const shareButton = getShareButton(page);
      await expect(shareButton).toBeVisible();
    });
  });

  test("report/flag button is visible", async ({ page, logger }) => {
    await logger.step("verify flag button exists", async () => {
      // Flag button is typically a ghost button with Flag icon
      const flagButton = page.locator("button").filter({ has: page.locator("[class*='lucide-flag'], svg") });
      await expect(flagButton.first()).toBeVisible();
    });
  });
});

test.describe("Profile Content Tabs", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });
  });

  test("displays content tabs (Prompts, Packs, Skills)", async ({ page, logger }) => {
    await logger.step("verify tabs exist", async () => {
      const tabs = await getProfileTabs(page);
      expect(tabs.length).toBeGreaterThanOrEqual(3);
    });

    await logger.step("verify Prompts tab", async () => {
      await expect(page.getByRole("tab", { name: /Prompts/i })).toBeVisible();
    });

    await logger.step("verify Packs tab", async () => {
      await expect(page.getByRole("tab", { name: /Packs/i })).toBeVisible();
    });

    await logger.step("verify Skills tab", async () => {
      await expect(page.getByRole("tab", { name: /Skills/i })).toBeVisible();
    });
  });

  test("Prompts tab shows count in label", async ({ page, logger }) => {
    await logger.step("verify prompts count in tab", async () => {
      // Tab should show something like "Prompts (42)"
      const promptsTab = page.getByRole("tab", { name: /Prompts.*\(42\)/i });
      await expect(promptsTab).toBeVisible();
    });
  });

  test("clicking tabs switches content", async ({ page, logger }) => {
    await logger.step("click Packs tab", async () => {
      await clickProfileTab(page, "Packs");
    });

    await logger.step("verify Packs tab is active", async () => {
      const packsTab = page.getByRole("tab", { name: /Packs/i });
      await expect(packsTab).toHaveAttribute("data-state", "active");
    });

    await logger.step("click Skills tab", async () => {
      await clickProfileTab(page, "Skills");
    });

    await logger.step("verify Skills tab is active", async () => {
      const skillsTab = page.getByRole("tab", { name: /Skills/i });
      await expect(skillsTab).toHaveAttribute("data-state", "active");
    });
  });
});

test.describe("Profile Content Display", () => {
  test("displays prompts in default tab", async ({ page, logger }) => {
    await logger.step("navigate to jeffreyemanuel profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify prompts tab is default", async () => {
      const promptsTab = page.getByRole("tab", { name: /Prompts/i });
      await expect(promptsTab).toHaveAttribute("data-state", "active");
    });

    await logger.step("verify prompt cards are displayed", async () => {
      // Should show at least some prompt cards
      const cards = await getTabContentCards(page);
      expect(cards).toBeGreaterThan(0);
    });
  });

  test("shows empty state for user with no content", async ({ page, logger }) => {
    await logger.step("navigate to demo_user profile", async () => {
      await navigateToProfile(page, "demo_user");
    });

    await logger.step("click Packs tab", async () => {
      await clickProfileTab(page, "Packs");
    });

    await logger.step("verify empty state message", async () => {
      // demo_user has 0 packs, should show empty state
      const emptyMessage = page.getByText(/No packs yet/i);
      await expect(emptyMessage).toBeVisible();
    });
  });
});

test.describe("Profile Responsive Layout", () => {
  test("mobile layout displays correctly", async ({ page, logger }) => {
    await logger.step("set mobile viewport", async () => {
      await page.setViewportSize({ width: 390, height: 844 });
    });

    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify profile header is visible", async () => {
      const displayName = await getDisplayName(page);
      expect(displayName).toBe("Jeffrey Emanuel");
    });

    await logger.step("verify avatar is visible on mobile", async () => {
      const hasAvatarElement = await hasAvatar(page);
      expect(hasAvatarElement).toBe(true);
    });

    await logger.step("verify tabs are accessible", async () => {
      const tabs = await getProfileTabs(page);
      expect(tabs.length).toBeGreaterThanOrEqual(3);
    });
  });

  test("desktop layout shows side-by-side elements", async ({ page, logger }) => {
    await logger.step("set desktop viewport", async () => {
      await page.setViewportSize({ width: 1280, height: 800 });
    });

    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify profile header uses flex layout", async () => {
      const header = page.locator("section").first();
      await expect(header).toBeVisible();
    });
  });
});

test.describe("Profile SEO and Metadata", () => {
  test("page has correct title", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify page title contains username", async () => {
      await expect(page).toHaveTitle(/Jeffrey Emanuel.*@jeffreyemanuel/i);
    });
  });
});
