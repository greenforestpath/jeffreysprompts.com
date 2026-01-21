import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Helper functions for Roadmap & Feature Voting E2E tests
 */

// Navigation helpers

export async function gotoRoadmap(page: Page): Promise<void> {
  await page.goto("/roadmap", { waitUntil: "networkidle", timeout: 60000 });
}

export async function gotoFeatureDetail(page: Page, featureId: string): Promise<void> {
  await page.goto(`/roadmap/${featureId}`, { waitUntil: "networkidle", timeout: 60000 });
}

export async function gotoFeatureSubmit(page: Page): Promise<void> {
  await page.goto("/roadmap/submit", { waitUntil: "networkidle", timeout: 60000 });
}

// Roadmap page selectors

export function getRoadmapHeader(page: Page): Locator {
  return page.getByRole("heading", { name: /product roadmap/i });
}

export function getStatsCards(page: Page): Locator {
  return page.locator(".grid.grid-cols-2.md\\:grid-cols-4 > div");
}

export function getTotalFeaturesCard(page: Page): Locator {
  return page.locator("text=Total Features").locator("..");
}

export function getInProgressCard(page: Page): Locator {
  return page.locator("text=In Progress").locator("..");
}

export function getShippedCard(page: Page): Locator {
  return page.locator("text=Shipped").locator("..");
}

export function getTotalVotesCard(page: Page): Locator {
  return page.locator("text=Total Votes").locator("..");
}

export function getSubmitButton(page: Page): Locator {
  return page.getByRole("link", { name: /submit.*feature.*request/i });
}

// Status column selectors

export function getStatusColumn(page: Page, status: "in_progress" | "planned" | "under_review"): Locator {
  const statusLabels: Record<string, string> = {
    in_progress: "In Progress",
    planned: "Planned",
    under_review: "Under Review",
  };
  return page.locator(`text=${statusLabels[status]}`).first().locator("xpath=ancestor::div[contains(@class, 'flex-col')]");
}

export function getShippedSection(page: Page): Locator {
  return page.locator("text=Recently Shipped").locator("..");
}

export function getDeclinedSection(page: Page): Locator {
  return page.locator("details").filter({ hasText: /declined/i });
}

// Feature card selectors

export function getFeatureCards(page: Page): Locator {
  return page.locator("[href^='/roadmap/']").filter({ has: page.locator("text=/votes/") });
}

export function getFeatureCard(page: Page, featureId: string): Locator {
  return page.locator(`[href='/roadmap/${featureId}']`);
}

export function getFeatureCardByTitle(page: Page, title: string): Locator {
  return getFeatureCards(page).filter({ hasText: title });
}

export function getFeatureVoteCount(card: Locator): Locator {
  return card.locator("text=/^\\d+$|^\\d+\\s*votes$/").first();
}

export function getFeatureCommentCount(card: Locator): Locator {
  return card.locator("text=/\\d+.*comments/i");
}

export function getFeatureStatusBadge(card: Locator): Locator {
  return card.locator(".badge, [class*='badge']").first();
}

// Feature detail page selectors

export function getFeatureTitle(page: Page): Locator {
  return page.getByRole("heading", { level: 1 });
}

export function getFeatureDescription(page: Page): Locator {
  return page.locator("p.text-muted-foreground").first();
}

export function getVoteButton(page: Page): Locator {
  return page.getByRole("button").filter({ has: page.locator("svg") }).filter({ hasText: "" }).first();
}

export function getVoteCountDisplay(page: Page): Locator {
  return page.locator("text=/^\\d+$").first();
}

export function getCommentsSection(page: Page): Locator {
  return page.locator("text=Comments").locator("..");
}

export function getCommentsList(page: Page): Locator {
  return page.locator("[class*='space-y-3']").filter({ has: page.locator("[class*='rounded-full']") });
}

export function getCommentCards(page: Page): Locator {
  return page.locator(".rounded-lg, .rounded-xl").filter({ has: page.locator("text=/^\\w+.*\\d+,\\s*\\d+/") });
}

export function getUseCaseSection(page: Page): Locator {
  return page.locator("text=Use Case").locator("..");
}

export function getStatusNoteSection(page: Page): Locator {
  return page.locator("text=Status Note").locator("..");
}

export function getBackToRoadmapLink(page: Page): Locator {
  return page.getByRole("link", { name: /back.*roadmap/i });
}

// Feature submit form selectors

export function getSubmitFormHeader(page: Page): Locator {
  return page.getByRole("heading", { name: /submit.*feature.*request/i });
}

export function getTitleInput(page: Page): Locator {
  return page.getByLabel(/feature title/i);
}

export function getDescriptionTextarea(page: Page): Locator {
  return page.getByLabel(/description/i);
}

export function getUseCaseTextarea(page: Page): Locator {
  return page.getByLabel(/use case/i);
}

export function getCancelButton(page: Page): Locator {
  return page.getByRole("button", { name: /cancel/i });
}

export function getSubmitFormButton(page: Page): Locator {
  return page.getByRole("button", { name: /submit.*feature.*request/i });
}

export function getCharacterCount(page: Page, field: "title" | "description"): Locator {
  const maxChars = field === "title" ? "100" : "2000";
  return page.locator(`text=/${maxChars} characters/i`);
}

export function getSubmissionGuidelines(page: Page): Locator {
  return page.locator("text=Submission Guidelines").locator("..");
}

// Action helpers

export async function voteForFeature(page: Page): Promise<void> {
  const voteButton = getVoteButton(page);
  await voteButton.click();
}

export async function submitFeatureRequest(
  page: Page,
  options: {
    title: string;
    description: string;
    useCase?: string;
  }
): Promise<void> {
  await getTitleInput(page).fill(options.title);
  await getDescriptionTextarea(page).fill(options.description);
  if (options.useCase) {
    await getUseCaseTextarea(page).fill(options.useCase);
  }
  await getSubmitFormButton(page).click();
}

export async function expandDeclinedSection(page: Page): Promise<void> {
  const details = getDeclinedSection(page);
  const isOpen = await details.getAttribute("open");
  if (isOpen === null) {
    await details.locator("summary").click();
  }
}

export async function navigateToFeatureFromCard(page: Page, featureId: string): Promise<void> {
  await getFeatureCard(page, featureId).click();
  await expect(page).toHaveURL(new RegExp(`/roadmap/${featureId}`));
}

// Assertion helpers

export async function assertRoadmapPageLoaded(page: Page): Promise<void> {
  await expect(getRoadmapHeader(page)).toBeVisible();
  await expect(getSubmitButton(page)).toBeVisible();
}

export async function assertFeatureDetailLoaded(page: Page): Promise<void> {
  await expect(getFeatureTitle(page)).toBeVisible();
  await expect(getFeatureDescription(page)).toBeVisible();
  await expect(getVoteCountDisplay(page)).toBeVisible();
}

export async function assertSubmitFormLoaded(page: Page): Promise<void> {
  await expect(getSubmitFormHeader(page)).toBeVisible();
  await expect(getTitleInput(page)).toBeVisible();
  await expect(getDescriptionTextarea(page)).toBeVisible();
}

export async function assertVoteCountChanged(
  page: Page,
  expectedCount: number
): Promise<void> {
  await expect(getVoteCountDisplay(page)).toHaveText(expectedCount.toString());
}

export async function assertFeatureCardVisible(page: Page, title: string): Promise<void> {
  await expect(getFeatureCardByTitle(page, title)).toBeVisible();
}

export async function assertStatusBadge(
  card: Locator,
  status: "under_review" | "planned" | "in_progress" | "shipped" | "declined"
): Promise<void> {
  const statusLabels: Record<string, string> = {
    under_review: "Under Review",
    planned: "Planned",
    in_progress: "In Progress",
    shipped: "Shipped",
    declined: "Declined",
  };
  await expect(card).toContainText(statusLabels[status]);
}

// Seed feature IDs (match roadmap-store.ts seed data)
export const SEED_FEATURES = {
  darkMode: "feat-001", // shipped
  promptVersionHistory: "feat-002", // in_progress
  teamWorkspaces: "feat-003", // planned
  apiAccess: "feat-004", // planned
  offlineMode: "feat-005", // under_review
  customCategories: "feat-006", // under_review
  mobileApp: "feat-007", // declined
  browserExtension: "feat-008", // in_progress
  analyticsInsights: "feat-009", // under_review
  importExport: "feat-010", // planned
} as const;

// Utility functions

export function getExpectedVoteCount(featureId: string): number {
  // Based on seed data in roadmap-store.ts
  const voteCounts: Record<string, number> = {
    "feat-001": 847,
    "feat-002": 423,
    "feat-003": 312,
    "feat-004": 287,
    "feat-005": 198,
    "feat-006": 156,
    "feat-007": 89,
    "feat-008": 234,
    "feat-009": 178,
    "feat-010": 145,
  };
  return voteCounts[featureId] || 0;
}
