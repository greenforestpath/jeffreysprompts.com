/**
 * Referral Program E2E Test Helpers
 *
 * Utilities for testing referral code generation, sharing, and tracking.
 */

import type { Page, Locator } from "@playwright/test";

/**
 * Referral constants matching the store
 */
export const REFERRAL_CONSTANTS = {
  REFERRER_REWARD_MONTHS: 1,
  MAX_REWARD_MONTHS_PER_YEAR: 12,
  REFEREE_EXTENDED_TRIAL_DAYS: 30,
  REFEREE_DISCOUNT_PERCENT: 20,
} as const;

/**
 * Referral code validation regex
 * Codes are 8 uppercase alphanumeric chars (excluding confusing chars like 0, O, 1, I)
 */
export const REFERRAL_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;

/**
 * Navigate to the referrals dashboard page
 */
export async function navigateToReferralsPage(page: Page): Promise<void> {
  await page.goto("/referrals");
  await page.waitForLoadState("networkidle");
}

/**
 * Navigate to a referral landing page
 */
export async function navigateToReferralLanding(page: Page, code: string): Promise<void> {
  await page.goto(`/r/${code}`);
  await page.waitForLoadState("networkidle");
}

/**
 * Get the referral card component
 */
export function getReferralCard(page: Page): Locator {
  return page.locator("[class*='Card']").filter({ hasText: /Your Referral Code|referral link/i });
}

/**
 * Get the displayed referral code from the UI
 */
export async function getDisplayedReferralCode(page: Page): Promise<string | null> {
  // The code is displayed in a mono font element
  const codeElement = page.locator("span.font-mono, code").filter({ hasText: REFERRAL_CODE_PATTERN });
  if (!(await codeElement.isVisible().catch(() => false))) {
    return null;
  }
  const code = await codeElement.textContent();
  return code?.trim() ?? null;
}

/**
 * Get the copy code button
 */
export function getCopyCodeButton(page: Page): Locator {
  return page.getByRole("button", { name: /copy/i });
}

/**
 * Get the share button on the referral card
 */
export function getShareButton(page: Page): Locator {
  return page.getByRole("button", { name: /share/i });
}

/**
 * Get the referral stats card
 */
export function getStatsCard(page: Page): Locator {
  return page.locator("[class*='Card']").filter({ hasText: /Stats|Referrals|rewards/i });
}

/**
 * Get the stat value by label
 */
export async function getStatValue(page: Page, label: string): Promise<number | null> {
  const statItem = page.locator("div").filter({ hasText: new RegExp(label, "i") }).first();
  if (!(await statItem.isVisible().catch(() => false))) {
    return null;
  }
  const valueText = await statItem.locator("p, span").filter({ hasText: /^\d+$/ }).textContent();
  return valueText ? parseInt(valueText, 10) : null;
}

/**
 * Check if share modal is open
 */
export async function isShareModalOpen(page: Page): Promise<boolean> {
  const modal = page.locator("[role='dialog'], [class*='Modal']");
  return modal.isVisible();
}

/**
 * Get share links in the share modal
 */
export async function getShareLinks(page: Page): Promise<{
  twitter: boolean;
  linkedin: boolean;
  email: boolean;
  sms: boolean;
}> {
  return {
    twitter: await page.getByRole("button", { name: /twitter|x\.com/i }).isVisible().catch(() => false),
    linkedin: await page.getByRole("button", { name: /linkedin/i }).isVisible().catch(() => false),
    email: await page.getByRole("button", { name: /email/i }).isVisible().catch(() => false),
    sms: await page.getByRole("button", { name: /sms|text/i }).isVisible().catch(() => false),
  };
}

/**
 * Close the share modal
 */
export async function closeShareModal(page: Page): Promise<void> {
  const closeButton = page.locator("[role='dialog'] button[aria-label*='close'], [role='dialog'] button:has(svg)").first();
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(200);
  }
}

/**
 * Get the referral URL input/display
 */
export async function getReferralUrl(page: Page): Promise<string | null> {
  // URL might be in an input or a text element
  const urlInput = page.locator("input[value*='jeffreysprompts.com/r/']");
  if (await urlInput.isVisible().catch(() => false)) {
    return urlInput.getAttribute("value");
  }

  const urlText = page.locator("text=/jeffreysprompts\\.com\\/r\\/[A-Z0-9]+/i");
  if (await urlText.isVisible().catch(() => false)) {
    const text = await urlText.textContent();
    const match = text?.match(/jeffreysprompts\.com\/r\/([A-Z0-9]+)/i);
    return match ? `https://${match[0]}` : null;
  }

  return null;
}

/**
 * Validate a referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return REFERRAL_CODE_PATTERN.test(code);
}

/**
 * Get the "How It Works" steps
 */
export async function getHowItWorksSteps(page: Page): Promise<string[]> {
  const steps = page.locator("[class*='Card']").filter({ has: page.locator("text=/^[123]$/") });
  const stepTexts: string[] = [];
  const count = await steps.count();

  for (let i = 0; i < count; i++) {
    const text = await steps.nth(i).textContent();
    if (text) {
      stepTexts.push(text.trim());
    }
  }

  return stepTexts;
}

/**
 * Get benefits list on landing page
 */
export async function getBenefitsList(page: Page): Promise<string[]> {
  const benefits = page.locator("li").filter({ has: page.locator("svg, [class*='Check']") });
  const benefitTexts: string[] = [];
  const count = await benefits.count();

  for (let i = 0; i < count; i++) {
    const text = await benefits.nth(i).textContent();
    if (text) {
      benefitTexts.push(text.trim());
    }
  }

  return benefitTexts;
}

/**
 * Get the CTA button on landing page
 */
export function getClaimRewardButton(page: Page): Locator {
  return page.getByRole("link", { name: /claim|get started/i });
}

/**
 * Verify landing page shows correct benefits
 */
export async function verifyLandingBenefits(page: Page): Promise<{
  hasExtendedTrial: boolean;
  hasDiscount: boolean;
}> {
  const pageText = await page.textContent("body");
  return {
    hasExtendedTrial: pageText?.includes(`${REFERRAL_CONSTANTS.REFEREE_EXTENDED_TRIAL_DAYS}`) ?? false,
    hasDiscount: pageText?.includes(`${REFERRAL_CONSTANTS.REFEREE_DISCOUNT_PERCENT}%`) ?? false,
  };
}

/**
 * API helper to get a referral code via API
 */
export async function fetchReferralCodeFromAPI(
  page: Page,
  userId: string
): Promise<{ code: string; url: string } | null> {
  const response = await page.request.get(`/api/referral/code?userId=${userId}`);
  if (!response.ok()) return null;

  const data = await response.json();
  return data.code && data.url ? { code: data.code, url: data.url } : null;
}

/**
 * API helper to validate a referral code
 */
export async function validateReferralCodeViaAPI(
  page: Page,
  code: string
): Promise<{ valid: boolean; referrerId?: string }> {
  const response = await page.request.get(`/api/referral/apply?code=${code}`);
  if (!response.ok()) {
    return { valid: false };
  }

  const data = await response.json();
  return { valid: data.valid ?? false, referrerId: data.referrerId };
}

/**
 * API helper to apply a referral code
 */
export async function applyReferralCodeViaAPI(
  page: Page,
  code: string,
  refereeId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await page.request.post("/api/referral/apply", {
    data: { code, refereeId },
  });

  if (!response.ok()) {
    const data = await response.json();
    return { success: false, error: data.error };
  }

  return { success: true };
}

/**
 * API helper to get referral stats
 */
export async function fetchReferralStatsFromAPI(
  page: Page,
  userId: string
): Promise<{
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  rewardedReferrals: number;
  totalRewardsEarned: number;
} | null> {
  const response = await page.request.get(`/api/referral/stats?userId=${userId}`);
  if (!response.ok()) return null;

  return response.json();
}

/**
 * Demo user IDs for testing
 */
export const TEST_USERS = {
  DEMO_USER: "demo-user-123",
  DEMO_REFERRER: "demo-referrer-456",
  DEMO_REFEREE: "demo-referee-789",
} as const;
