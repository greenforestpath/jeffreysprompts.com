/**
 * Screen reader announcement utilities for WCAG 4.1.3 (Status Messages)
 *
 * Use these functions to announce dynamic content changes to assistive technology
 * without moving focus.
 */

let announceContainer: HTMLElement | null = null;

/**
 * Initialize the announcement container in the DOM.
 * Called automatically on first announcement.
 */
function ensureContainer(): HTMLElement {
  if (typeof window === "undefined") {
    throw new Error("announceToScreenReader can only be used in browser");
  }

  if (!announceContainer) {
    announceContainer = document.createElement("div");
    announceContainer.setAttribute("role", "status");
    announceContainer.setAttribute("aria-live", "polite");
    announceContainer.setAttribute("aria-atomic", "true");
    announceContainer.className = "sr-only";
    announceContainer.id = "a11y-announcer";
    document.body.appendChild(announceContainer);
  }
  return announceContainer;
}

/**
 * Announce a message to screen readers.
 *
 * @param message - The message to announce
 * @param priority - "polite" (default) waits for current speech, "assertive" interrupts
 *
 * @example
 * ```ts
 * // Announce after user action
 * announceToScreenReader("Prompt copied to clipboard");
 *
 * // Announce errors immediately
 * announceToScreenReader("Error: Failed to save", "assertive");
 * ```
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof window === "undefined") return;

  const container = ensureContainer();
  container.setAttribute("aria-live", priority);

  // Clear and re-add to trigger announcement
  container.textContent = "";

  // Use requestAnimationFrame to ensure DOM update triggers announcement
  requestAnimationFrame(() => {
    container.textContent = message;
  });
}

/**
 * Announce a formatted count update.
 *
 * @example
 * ```ts
 * announceCount(5, "result", "results"); // "5 results"
 * announceCount(1, "item", "items"); // "1 item"
 * announceCount(0, "match", "matches"); // "No matches"
 * ```
 */
export function announceCount(
  count: number,
  singular: string,
  plural: string
): void {
  if (count === 0) {
    announceToScreenReader(`No ${plural}`);
  } else if (count === 1) {
    announceToScreenReader(`1 ${singular}`);
  } else {
    announceToScreenReader(`${count} ${plural}`);
  }
}

/**
 * Clear the announcement container.
 * Useful when component unmounts.
 */
export function clearAnnouncement(): void {
  if (announceContainer) {
    announceContainer.textContent = "";
  }
}
