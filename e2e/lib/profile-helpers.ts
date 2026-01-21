/**
 * Profile E2E Test Helpers
 *
 * Utilities for testing public user profiles and reputation display.
 */

import type { Page, Locator } from "@playwright/test";

/**
 * Badge type enumeration matching profile-store.ts
 */
export type BadgeType =
  | "new_member"
  | "contributor"
  | "popular"
  | "top_rated"
  | "featured_author"
  | "founding_member"
  | "creator"
  | "early_adopter"
  | "premium"
  | "verified";

/**
 * Expected badge labels (human-readable)
 */
export const BADGE_LABELS: Record<BadgeType, string> = {
  new_member: "New Member",
  contributor: "Contributor",
  popular: "Popular",
  top_rated: "Top Rated",
  featured_author: "Featured Author",
  founding_member: "Founding Member",
  creator: "Creator",
  early_adopter: "Early Adopter",
  premium: "Premium",
  verified: "Verified",
};

/**
 * Navigate to a user's profile page
 */
export async function navigateToProfile(page: Page, username: string): Promise<void> {
  await page.goto(`/user/${username}`);
  await page.waitForLoadState("networkidle");
}

/**
 * Get the profile header card locator
 */
export function getProfileHeader(page: Page): Locator {
  return page.locator("section").first().locator("[class*='CardContent']").first();
}

/**
 * Get the display name from profile header
 */
export async function getDisplayName(page: Page): Promise<string | null> {
  const heading = page.locator("h1").first();
  return heading.textContent();
}

/**
 * Get the username from profile header (the @username text)
 */
export async function getUsername(page: Page): Promise<string | null> {
  const usernameText = page.locator("text=@").first();
  const content = await usernameText.textContent();
  return content ? content.replace("@", "") : null;
}

/**
 * Get the bio text if visible
 */
export async function getBio(page: Page): Promise<string | null> {
  // Bio is displayed after the username, in a paragraph with specific styling
  const bioSelector = "p.text-neutral-700";
  const bio = page.locator(bioSelector).first();
  const isVisible = await bio.isVisible().catch(() => false);
  if (!isVisible) return null;
  return bio.textContent();
}

/**
 * Get visible badges on the profile
 */
export async function getVisibleBadges(page: Page): Promise<string[]> {
  const badges = page.locator("[class*='Badge']");
  const badgeTexts: string[] = [];
  const count = await badges.count();

  for (let i = 0; i < count; i++) {
    const text = await badges.nth(i).textContent();
    if (text) {
      badgeTexts.push(text.trim());
    }
  }

  return badgeTexts;
}

/**
 * Check if a specific badge is displayed
 */
export async function hasBadge(page: Page, badgeLabel: string): Promise<boolean> {
  const badges = await getVisibleBadges(page);
  return badges.some((b) => b.includes(badgeLabel));
}

/**
 * Get stats from the profile (prompts, packs, skills, reputation/saves)
 */
export async function getProfileStats(page: Page): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};
  const statsSection = page.locator(".grid.grid-cols-2");

  if (!(await statsSection.isVisible().catch(() => false))) {
    return stats;
  }

  // Each stat item has a number and a label
  const statItems = statsSection.locator("> div");
  const count = await statItems.count();

  for (let i = 0; i < count; i++) {
    const item = statItems.nth(i);
    const valueText = await item.locator("p.text-2xl").textContent();
    const labelText = await item.locator("p.text-sm").textContent();

    if (valueText && labelText) {
      const value = parseInt(valueText.replace(/,/g, ""), 10);
      const label = labelText.toLowerCase();
      stats[label] = value;
    }
  }

  return stats;
}

/**
 * Get the reputation score if displayed
 */
export async function getReputationScore(page: Page): Promise<number | null> {
  const stats = await getProfileStats(page);
  return stats["reputation"] ?? null;
}

/**
 * Check if the profile shows the join date
 */
export async function hasJoinDate(page: Page): Promise<boolean> {
  const joinDateText = page.getByText(/Member since/i);
  return joinDateText.isVisible();
}

/**
 * Get the location if displayed
 */
export async function getLocation(page: Page): Promise<string | null> {
  const locationLocator = page.locator("span").filter({ hasText: /📍|MapPin/ });
  if (!(await locationLocator.isVisible().catch(() => false))) {
    // Try text-based approach
    const mapPinSpan = page.locator("span:has(svg)").filter({ hasText: /San Francisco|New York|London/i });
    const text = await mapPinSpan.textContent().catch(() => null);
    return text?.trim() ?? null;
  }
  return locationLocator.textContent();
}

/**
 * Check if the profile has social links (Twitter, GitHub, website)
 */
export async function getSocialLinks(page: Page): Promise<{
  twitter: string | null;
  github: string | null;
  website: string | null;
}> {
  const twitterLink = page.locator("a[href*='twitter.com'], a[href*='x.com']").first();
  const githubLink = page.locator("a[href*='github.com']").first();
  const websiteLink = page.locator("a").filter({ hasText: "Website" }).first();

  return {
    twitter: await twitterLink.getAttribute("href").catch(() => null),
    github: await githubLink.getAttribute("href").catch(() => null),
    website: await websiteLink.getAttribute("href").catch(() => null),
  };
}

/**
 * Get the avatar element
 */
export function getAvatar(page: Page): Locator {
  // Avatar is either an img or a div with initials
  return page.locator("img[alt], div.rounded-full").first();
}

/**
 * Check if profile has avatar displayed
 */
export async function hasAvatar(page: Page): Promise<boolean> {
  const avatar = getAvatar(page);
  return avatar.isVisible();
}

/**
 * Get the tabs in the profile content section
 */
export async function getProfileTabs(page: Page): Promise<string[]> {
  const tabs = page.locator("[role='tablist'] button");
  const tabTexts: string[] = [];
  const count = await tabs.count();

  for (let i = 0; i < count; i++) {
    const text = await tabs.nth(i).textContent();
    if (text) {
      tabTexts.push(text.trim());
    }
  }

  return tabTexts;
}

/**
 * Click on a specific tab in the profile
 */
export async function clickProfileTab(page: Page, tabName: string): Promise<void> {
  const tab = page.locator("[role='tablist'] button").filter({ hasText: new RegExp(tabName, "i") });
  await tab.click();
  await page.waitForTimeout(200); // Wait for tab content to load
}

/**
 * Get content cards in the currently active tab
 */
export async function getTabContentCards(page: Page): Promise<number> {
  const tabContent = page.locator("[role='tabpanel']");
  const cards = tabContent.locator("[class*='Card']");
  return cards.count();
}

/**
 * Check if empty state is shown in current tab
 */
export async function hasEmptyState(page: Page): Promise<boolean> {
  return page.getByText(/No .* yet/i).isVisible();
}

/**
 * Share button helper
 */
export function getShareButton(page: Page): Locator {
  return page.getByRole("button", { name: /share/i });
}

/**
 * Flag/report button helper
 */
export function getReportButton(page: Page): Locator {
  return page.locator("button").filter({ has: page.locator("svg") }).last();
}

/**
 * Seed users available in the test environment
 */
export const TEST_USERS = {
  jeffreyemanuel: {
    username: "jeffreyemanuel",
    displayName: "Jeffrey Emanuel",
    hasAvatar: false,
    hasBio: true,
    hasLocation: true,
    hasTwitter: true,
    hasGithub: true,
    hasWebsite: true,
    expectedBadges: ["Contributor", "Popular", "Top Rated", "Featured Author", "Founding Member"],
    stats: {
      prompts: 42,
      packs: 3,
      skills: 8,
    },
  },
  demo_user: {
    username: "demo_user",
    displayName: "Demo User",
    hasAvatar: false,
    hasBio: true,
    hasLocation: false,
    hasTwitter: false,
    hasGithub: false,
    hasWebsite: false,
    expectedBadges: ["Contributor"],
    stats: {
      prompts: 5,
      packs: 0,
      skills: 2,
    },
  },
} as const;
