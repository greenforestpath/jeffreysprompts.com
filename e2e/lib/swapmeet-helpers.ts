import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function gotoSwapMeet(page: Page): Promise<void> {
  await page.goto("/swap-meet", { waitUntil: "networkidle", timeout: 60000 });
  await expect(page.getByRole("heading", { level: 1, name: "Swap Meet" })).toBeVisible();
}

export async function gotoSwapMeetPrompt(page: Page, promptId: string): Promise<void> {
  await page.goto(`/swap-meet/${promptId}`, { waitUntil: "networkidle", timeout: 60000 });
}

export function getSwapMeetSearchInput(page: Page): Locator {
  return page.getByPlaceholder("Search community prompts...");
}

export function getCommunityPromptCards(page: Page): Locator {
  return page.locator("[data-testid='community-prompt-card']");
}

export function getCommunityPromptTitles(page: Page): Locator {
  return getCommunityPromptCards(page).locator("h3");
}

export async function readResultsCount(page: Page): Promise<number | null> {
  const header = page.getByText(/^Showing\s+\d+\s+prompts/i).first();
  const text = await header.textContent();
  if (!text) return null;
  const match = text.match(/Showing\s+(\d+)\s+prompts/i);
  return match ? Number(match[1]) : null;
}

export async function openSortMenu(page: Page): Promise<void> {
  const trigger = page.getByRole("combobox");
  await trigger.click();
}

export async function selectSortOption(page: Page, label: string): Promise<void> {
  await openSortMenu(page);
  await page.getByText(label, { exact: true }).click();
}

export async function openMoreFilters(page: Page): Promise<void> {
  await page.getByRole("button", { name: /more filters/i }).click();
}
