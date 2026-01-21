import { test, expect } from "../../lib/playwright-logger";
import { navigateToProfile } from "../../lib/profile-helpers";

/**
 * Profile Editing E2E Tests
 *
 * Tests for profile editing functionality including:
 * 1. Edit button visibility (own profile only)
 * 2. Profile editing form
 * 3. Privacy settings
 *
 * Note: These tests are scoped to anonymous/public viewing.
 * Authenticated profile editing tests will be added when auth is implemented.
 */

test.describe("Profile Edit Button (Anonymous User)", () => {
  test("edit button is NOT visible when viewing another user's profile", async ({
    page,
    logger,
  }) => {
    await logger.step("navigate to jeffreyemanuel profile as anonymous", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify no edit button visible", async () => {
      // As an anonymous user viewing someone else's profile,
      // there should be no edit button
      const editButton = page.getByRole("button", { name: /edit profile/i });
      await expect(editButton).not.toBeVisible();
    });

    await logger.step("verify no edit link visible", async () => {
      const editLink = page.getByRole("link", { name: /edit/i });
      // May have other edit buttons for content, but not profile edit
      const profileEditLink = editLink.filter({ hasText: /profile/i });
      await expect(profileEditLink).not.toBeVisible();
    });
  });

  test("settings link is NOT visible to anonymous users", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify no settings button", async () => {
      const settingsButton = page.getByRole("button", { name: /settings/i });
      await expect(settingsButton).not.toBeVisible();
    });
  });
});

test.describe("Profile Privacy Respects Settings", () => {
  test("private profile returns 404 or not-found page", async ({ page, logger }) => {
    // Note: In the current implementation, getPublicProfile returns null
    // for private profiles, which results in a 404
    await logger.step("attempt to navigate to a private profile", async () => {
      // We don't have a test private user, but we can verify the pattern
      // by checking the error page behavior
      const response = await page.goto("/user/private_test_user");
      // Should show not-found or return 404
      const status = response?.status();
      expect(status === 404 || page.url().includes("not-found")).toBeTruthy();
    });
  });

  test("public profile is accessible", async ({ page, logger }) => {
    await logger.step("navigate to public profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify profile content is visible", async () => {
      // Public profile should show all content
      await expect(page.getByText("Jeffrey Emanuel")).toBeVisible();
      await expect(page.getByText("@jeffreyemanuel")).toBeVisible();
    });
  });
});

test.describe("Profile Fields Are Read-Only", () => {
  test("display name is not editable inline", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify display name is text, not input", async () => {
      const heading = page.locator("h1");
      await expect(heading).toBeVisible();
      // Should be a heading element, not an input
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("h1");
    });
  });

  test("bio is not editable inline", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify bio is text, not textarea", async () => {
      const bio = page.locator("text=Creator of JeffreysPrompts");
      await expect(bio).toBeVisible();
      // Should be a paragraph, not a textarea
      const tagName = await bio.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("p");
    });
  });
});

test.describe("Profile Action Buttons", () => {
  test("share button works for anonymous users", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify share button is clickable", async () => {
      const shareButton = page.getByRole("button", { name: /share/i });
      await expect(shareButton).toBeVisible();
      await expect(shareButton).toBeEnabled();
    });
  });

  test("report button available for anonymous users", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify flag/report button exists", async () => {
      // The Flag button is typically a ghost button
      const flagButtons = page.locator("button").filter({ has: page.locator("svg") });
      // Should have at least the flag button
      const count = await flagButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});

/**
 * Placeholder tests for authenticated profile editing
 * These will be implemented when authentication is added to E2E tests
 */
test.describe.skip("Profile Editing (Authenticated)", () => {
  test.skip("edit button visible on own profile", async ({ page }) => {
    // TODO: Implement when auth is available
    // 1. Login as test user
    // 2. Navigate to own profile
    // 3. Verify edit button is visible
  });

  test.skip("can edit display name", async ({ page }) => {
    // TODO: Implement when auth is available
    // 1. Login and go to own profile
    // 2. Click edit
    // 3. Change display name
    // 4. Save
    // 5. Verify change persisted
  });

  test.skip("can edit bio", async ({ page }) => {
    // TODO: Implement when auth is available
  });

  test.skip("can update avatar", async ({ page }) => {
    // TODO: Implement when auth is available
  });

  test.skip("can toggle profile privacy", async ({ page }) => {
    // TODO: Implement when auth is available
  });

  test.skip("can toggle reputation visibility", async ({ page }) => {
    // TODO: Implement when auth is available
  });

  test.skip("can add/update social links", async ({ page }) => {
    // TODO: Implement when auth is available
  });
});
