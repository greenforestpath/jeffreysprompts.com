"use client";

import { useEffect, useRef } from "react";

interface LiveRegionProps {
  /** The message to announce to screen readers */
  message: string;
  /** Priority level - polite waits for current speech, assertive interrupts */
  priority?: "polite" | "assertive";
  /** If true, the entire region is re-read when updated */
  atomic?: boolean;
  /** Additional CSS classes (region is visually hidden by default) */
  className?: string;
}

/**
 * ARIA live region component for WCAG 4.1.3 (Status Messages)
 *
 * Announces dynamic content changes to assistive technology without moving focus.
 * Use for status updates, notifications, search results counts, etc.
 *
 * @example
 * ```tsx
 * // Announce search results count
 * <LiveRegion message={`${results.length} results found`} />
 *
 * // Announce errors immediately
 * <LiveRegion message="Error: Failed to save" priority="assertive" />
 * ```
 */
export function LiveRegion({
  message,
  priority = "polite",
  atomic = true,
  className,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const prevMessageRef = useRef<string>("");

  useEffect(() => {
    // Only announce if message changed
    if (message !== prevMessageRef.current && regionRef.current) {
      // Clear and re-add to ensure announcement
      regionRef.current.textContent = "";
      requestAnimationFrame(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      });
      prevMessageRef.current = message;
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={className ?? "sr-only"}
    >
      {message}
    </div>
  );
}

/**
 * Alert live region for error messages.
 * Uses role="alert" which is implicitly aria-live="assertive".
 */
export function AlertRegion({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div role="alert" className={className ?? "sr-only"}>
      {message}
    </div>
  );
}
