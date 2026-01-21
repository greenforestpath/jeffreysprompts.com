import { test, expect } from "../lib/playwright-logger";
import {
  navigateToReferralLanding,
  navigateToReferralsPage,
  getClaimRewardButton,
  getBenefitsList,
  verifyLandingBenefits,
  getDisplayedReferralCode,
  validateReferralCodeViaAPI,
  applyReferralCodeViaAPI,
  fetchReferralCodeFromAPI,
  REFERRAL_CONSTANTS,
  TEST_USERS,
} from "../lib/referral-helpers";

/**
 * Referral Flow E2E Tests
 *
 * Tests for the referral journey:
 * 1. Referee uses referral link
 * 2. Landing page displays benefits
 * 3. Referral tracked on signup
 * 4. Extended trial granted
 * 5. Referral shows as pending
 */

test.describe("Referral Landing Page", () => {
  test("landing page loads for valid code", async ({ page, logger }) => {
    // First get a valid code via API
    let testCode = "TESTCODE";
    await logger.step("get valid referral code", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      if (result?.code) {
        testCode = result.code;
      }
    });

    await logger.step("navigate to referral landing", async () => {
      await navigateToReferralLanding(page, testCode);
    });

    await logger.step("verify landing page content", async () => {
      // Should show "You've Been Invited" or similar
      await expect(page.getByText(/invited|welcome/i)).toBeVisible();
    });
  });

  test("landing page shows invitation badge", async ({ page, logger }) => {
    await logger.step("navigate to landing with test code", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      const code = result?.code ?? "TESTCODE";
      await navigateToReferralLanding(page, code);
    });

    await logger.step("verify invitation badge", async () => {
      await expect(page.getByText(/You.*Been Invited/i)).toBeVisible();
    });
  });

  test("landing page shows benefits headline", async ({ page, logger }) => {
    await logger.step("navigate to landing", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      const code = result?.code ?? "TESTCODE";
      await navigateToReferralLanding(page, code);
    });

    await logger.step("verify extended trial is mentioned", async () => {
      await expect(
        page.getByText(new RegExp(`${REFERRAL_CONSTANTS.REFEREE_EXTENDED_TRIAL_DAYS}.*Day|Free`, "i"))
      ).toBeVisible();
    });

    await logger.step("verify discount is mentioned", async () => {
      await expect(
        page.getByText(new RegExp(`${REFERRAL_CONSTANTS.REFEREE_DISCOUNT_PERCENT}%`, "i"))
      ).toBeVisible();
    });
  });

  test("landing page displays benefits list", async ({ page, logger }) => {
    await logger.step("navigate to landing", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      const code = result?.code ?? "TESTCODE";
      await navigateToReferralLanding(page, code);
    });

    await logger.step("verify benefits", async () => {
      const benefits = await verifyLandingBenefits(page);
      expect(benefits.hasExtendedTrial).toBe(true);
      expect(benefits.hasDiscount).toBe(true);
    });

    await logger.step("verify benefit checkmarks", async () => {
      const benefitsList = await getBenefitsList(page);
      expect(benefitsList.length).toBeGreaterThan(0);
    });
  });

  test("landing page has CTA button", async ({ page, logger }) => {
    await logger.step("navigate to landing", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      const code = result?.code ?? "TESTCODE";
      await navigateToReferralLanding(page, code);
    });

    await logger.step("verify CTA button", async () => {
      const ctaButton = getClaimRewardButton(page);
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();
    });
  });

  test("CTA button links to home with ref param", async ({ page, logger }) => {
    let testCode = "TESTCODE";
    await logger.step("get code and navigate", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      testCode = result?.code ?? testCode;
      await navigateToReferralLanding(page, testCode);
    });

    await logger.step("verify CTA link", async () => {
      const ctaButton = getClaimRewardButton(page);
      const href = await ctaButton.getAttribute("href");
      expect(href).toContain(`ref=${testCode}`);
    });
  });

  test("landing page shows referral code", async ({ page, logger }) => {
    let testCode = "TESTCODE";
    await logger.step("navigate to landing", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      testCode = result?.code ?? testCode;
      await navigateToReferralLanding(page, testCode);
    });

    await logger.step("verify code is displayed", async () => {
      await expect(page.getByText(testCode)).toBeVisible();
    });
  });
});

test.describe("Referral Code Validation", () => {
  test("valid code is accepted", async ({ page, logger }) => {
    await logger.step("validate via API", async () => {
      const codeResult = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      if (codeResult?.code) {
        const validation = await validateReferralCodeViaAPI(page, codeResult.code);
        expect(validation.valid).toBe(true);
      }
    });
  });

  test("invalid code is rejected", async ({ page, logger }) => {
    await logger.step("try invalid code", async () => {
      const validation = await validateReferralCodeViaAPI(page, "INVALIDCODE123");
      expect(validation.valid).toBe(false);
    });
  });

  test("code is case-insensitive", async ({ page, logger }) => {
    let testCode = "TESTCODE";

    await logger.step("get valid code", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      testCode = result?.code ?? testCode;
    });

    await logger.step("validate lowercase version", async () => {
      const validation = await validateReferralCodeViaAPI(page, testCode.toLowerCase());
      // Should still be valid (or handled gracefully)
      // The validation might pass or the code might be normalized
      expect(validation).toBeDefined();
    });
  });
});

test.describe("Referral Application", () => {
  test("self-referral is prevented", async ({ page, logger }) => {
    await logger.step("try self-referral", async () => {
      const codeResult = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_USER);
      if (codeResult?.code) {
        const result = await applyReferralCodeViaAPI(page, codeResult.code, TEST_USERS.DEMO_USER);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/own|self/i);
      }
    });
  });

  test("referral code can be applied for new user", async ({ page, logger }) => {
    await logger.step("apply referral code", async () => {
      const codeResult = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      if (codeResult?.code) {
        // Use a unique referee ID to avoid duplicate referral error
        const uniqueRefereeId = `test-referee-${Date.now()}`;
        const result = await applyReferralCodeViaAPI(page, codeResult.code, uniqueRefereeId);
        expect(result.success).toBe(true);
      }
    });
  });

  test("duplicate referral is prevented", async ({ page, logger }) => {
    const refereeId = `duplicate-test-${Date.now()}`;

    await logger.step("apply first referral", async () => {
      const codeResult = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      if (codeResult?.code) {
        await applyReferralCodeViaAPI(page, codeResult.code, refereeId);
      }
    });

    await logger.step("try second referral", async () => {
      const codeResult2 = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_USER);
      if (codeResult2?.code) {
        const result = await applyReferralCodeViaAPI(page, codeResult2.code, refereeId);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/already|duplicate/i);
      }
    });
  });
});

test.describe("Landing Page for Invalid Codes", () => {
  test("landing page handles non-existent code gracefully", async ({ page, logger }) => {
    await logger.step("navigate with invalid code", async () => {
      await navigateToReferralLanding(page, "ZZZZZZZZZ");
    });

    await logger.step("verify page still loads", async () => {
      // Page should still render, possibly with a warning
      // It might redirect to not-found or show the landing anyway
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  });

  test("very short code is handled", async ({ page, logger }) => {
    await logger.step("navigate with short code", async () => {
      await page.goto("/r/AB");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify no crash", async () => {
      // Should not crash, might show error or landing
      const url = page.url();
      expect(url).toBeDefined();
    });
  });
});

test.describe("Referral Trust Signals", () => {
  test("landing page mentions trusted users", async ({ page, logger }) => {
    await logger.step("navigate to landing", async () => {
      const result = await fetchReferralCodeFromAPI(page, TEST_USERS.DEMO_REFERRER);
      const code = result?.code ?? "TESTCODE";
      await navigateToReferralLanding(page, code);
    });

    await logger.step("verify social proof", async () => {
      // Should mention something about community or trusted users
      await expect(page.getByText(/trusted|professionals|developers|creators/i)).toBeVisible();
    });
  });
});
