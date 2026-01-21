import { test, expect } from "../../lib/playwright-logger";
import {
  navigateToProfile,
  getVisibleBadges,
  hasBadge,
  getProfileStats,
  getReputationScore,
  BADGE_LABELS,
  TEST_USERS,
} from "../../lib/profile-helpers";

/**
 * Profile Reputation & Badges E2E Tests
 *
 * Tests for reputation display and badge system including:
 * 1. Reputation score visible
 * 2. Badges/achievements shown
 * 3. Total contributions shown
 * 4. Stats grid displays correctly
 */

test.describe("Reputation Score Display", () => {
  test("displays reputation score for user who shows it", async ({ page, logger }) => {
    await logger.step("navigate to jeffreyemanuel profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify stats section exists", async () => {
      await expect(page.locator(".grid.grid-cols-2")).toBeVisible();
    });

    await logger.step("verify reputation score is displayed", async () => {
      // Reputation should be shown in the stats grid
      const stats = await getProfileStats(page);
      // jeffreyemanuel should have a positive reputation score
      // Based on the formula: prompts*10 + saves*1 + ratings*2 + featured*50 + days*0.1
      // With 42 prompts, 1234 saves, 156 ratings, 5 featured = 420 + 1234 + 312 + 250 + ~73 = ~2289
      expect(stats["reputation"]).toBeGreaterThan(1000);
    });
  });

  test("reputation score is formatted with commas", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify score formatting", async () => {
      // Large numbers should be formatted with commas (e.g., "1,234")
      const statsSection = page.locator(".grid.grid-cols-2");
      const reputationValue = statsSection.locator("p.text-2xl").filter({ hasText: /[0-9,]+/ });
      // At least one should contain a comma if it's >= 1000
      const values = await reputationValue.allTextContents();
      const hasLargeNumber = values.some((v) => {
        const num = parseInt(v.replace(/,/g, ""), 10);
        return num >= 1000 && v.includes(",");
      });
      expect(hasLargeNumber).toBe(true);
    });
  });
});

test.describe("Profile Stats Grid", () => {
  test.beforeEach(async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });
  });

  test("displays prompts count", async ({ page, logger }) => {
    await logger.step("verify prompts stat", async () => {
      const stats = await getProfileStats(page);
      expect(stats["prompts"]).toBe(TEST_USERS.jeffreyemanuel.stats.prompts);
    });
  });

  test("displays packs count", async ({ page, logger }) => {
    await logger.step("verify packs stat", async () => {
      const stats = await getProfileStats(page);
      expect(stats["packs"]).toBe(TEST_USERS.jeffreyemanuel.stats.packs);
    });
  });

  test("displays skills count", async ({ page, logger }) => {
    await logger.step("verify skills stat", async () => {
      const stats = await getProfileStats(page);
      expect(stats["skills"]).toBe(TEST_USERS.jeffreyemanuel.stats.skills);
    });
  });

  test("stats grid uses responsive columns", async ({ page, logger }) => {
    await logger.step("verify grid layout", async () => {
      const grid = page.locator(".grid.grid-cols-2");
      await expect(grid).toBeVisible();
      // Should have sm:grid-cols-4 for larger screens
      await expect(grid).toHaveClass(/sm:grid-cols-4/);
    });
  });
});

test.describe("Badge Display", () => {
  test("displays badges for accomplished user", async ({ page, logger }) => {
    await logger.step("navigate to jeffreyemanuel profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify badges section exists", async () => {
      const badges = await getVisibleBadges(page);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  test("displays Contributor badge for user with 5+ prompts", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify Contributor badge", async () => {
      const hasContributor = await hasBadge(page, BADGE_LABELS.contributor);
      expect(hasContributor).toBe(true);
    });
  });

  test("displays Popular badge for user with 100+ saves", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify Popular badge", async () => {
      const hasPopular = await hasBadge(page, BADGE_LABELS.popular);
      expect(hasPopular).toBe(true);
    });
  });

  test("displays Top Rated badge for high-rated user", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify Top Rated badge", async () => {
      const hasTopRated = await hasBadge(page, BADGE_LABELS.top_rated);
      expect(hasTopRated).toBe(true);
    });
  });

  test("displays Featured Author badge for featured content", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify Featured Author badge", async () => {
      const hasFeatured = await hasBadge(page, BADGE_LABELS.featured_author);
      expect(hasFeatured).toBe(true);
    });
  });

  test("displays Founding Member badge for early user", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify Founding Member badge", async () => {
      const hasFounding = await hasBadge(page, BADGE_LABELS.founding_member);
      expect(hasFounding).toBe(true);
    });
  });

  test("badges have appropriate colors", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify badges have color classes", async () => {
      const badges = page.locator("[class*='Badge']");
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);

      // Badges should have color-related classes
      for (let i = 0; i < count; i++) {
        const badge = badges.nth(i);
        const className = await badge.getAttribute("class");
        // Should have some color-related class like bg-green, text-purple, etc.
        expect(className).toMatch(/bg-|text-/);
      }
    });
  });
});

test.describe("Badge Display for New User", () => {
  test("displays fewer badges for user with less activity", async ({ page, logger }) => {
    await logger.step("navigate to demo_user profile", async () => {
      await navigateToProfile(page, "demo_user");
    });

    await logger.step("verify demo_user has Contributor badge", async () => {
      // demo_user has 5 prompts, which meets the Contributor threshold
      const hasContributor = await hasBadge(page, BADGE_LABELS.contributor);
      expect(hasContributor).toBe(true);
    });

    await logger.step("verify demo_user does NOT have Popular badge", async () => {
      // demo_user has only 23 saves, below the 100 threshold
      const hasPopular = await hasBadge(page, BADGE_LABELS.popular);
      expect(hasPopular).toBe(false);
    });

    await logger.step("verify demo_user does NOT have Founding Member", async () => {
      // demo_user joined in June 2024, after the founding date
      const hasFounding = await hasBadge(page, BADGE_LABELS.founding_member);
      expect(hasFounding).toBe(false);
    });
  });
});

test.describe("Reputation Tooltip/Info", () => {
  test("badge has accessible label", async ({ page, logger }) => {
    await logger.step("navigate to profile", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
    });

    await logger.step("verify badges are labeled", async () => {
      const badges = page.locator("[class*='Badge']");
      const count = await badges.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const badge = badges.nth(i);
        const text = await badge.textContent();
        // Badge should have visible text label
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });
  });
});

test.describe("Reputation Comparison", () => {
  test("higher activity user has higher reputation", async ({ page, logger }) => {
    let jeffreyRep: number | null = null;
    let demoRep: number | null = null;

    await logger.step("get jeffreyemanuel reputation", async () => {
      await navigateToProfile(page, "jeffreyemanuel");
      jeffreyRep = await getReputationScore(page);
    });

    await logger.step("get demo_user reputation", async () => {
      await navigateToProfile(page, "demo_user");
      demoRep = await getReputationScore(page);
    });

    await logger.step("compare reputation scores", async () => {
      expect(jeffreyRep).not.toBeNull();
      expect(demoRep).not.toBeNull();
      // jeffreyemanuel should have significantly higher reputation
      if (jeffreyRep !== null && demoRep !== null) {
        expect(jeffreyRep).toBeGreaterThan(demoRep);
      }
    });
  });
});
