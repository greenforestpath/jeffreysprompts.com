/**
 * Usage tracking - records prompt copy events to git-tracked JSONL file
 */

export interface UsageEvent {
  prompt_id: string;
  ts: number;
  category: string;
}

/**
 * Record a usage event by POSTing to the API
 */
export async function trackUsage(promptId: string, category: string): Promise<boolean> {
  try {
    const response = await fetch("/api/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt_id: promptId, category }),
    });
    return response.ok;
  } catch (err) {
    console.error("Failed to track usage:", err);
    return false;
  }
}

/**
 * Parse usage counts from loaded events
 */
export function computeUsageCounts(events: UsageEvent[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.prompt_id, (counts.get(event.prompt_id) ?? 0) + 1);
  }
  return counts;
}
