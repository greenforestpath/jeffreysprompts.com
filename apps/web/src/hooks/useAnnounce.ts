"use client";

import { useCallback } from "react";
import { announceToScreenReader, announceCount } from "@/lib/accessibility";

/**
 * Hook for announcing messages to screen readers.
 *
 * @example
 * ```tsx
 * function CopyButton() {
 *   const announce = useAnnounce();
 *
 *   const handleCopy = async () => {
 *     await navigator.clipboard.writeText(text);
 *     announce("Copied to clipboard");
 *   };
 *
 *   return <button onClick={handleCopy}>Copy</button>;
 * }
 * ```
 */
export function useAnnounce() {
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      announceToScreenReader(message, priority);
    },
    []
  );

  return announce;
}

/**
 * Hook for announcing counts (search results, items, etc.)
 *
 * @example
 * ```tsx
 * function SearchResults({ results }) {
 *   const announceResults = useAnnounceCount();
 *
 *   useEffect(() => {
 *     announceResults(results.length, "result", "results");
 *   }, [results.length]);
 * }
 * ```
 */
export function useAnnounceCount() {
  const announce = useCallback(
    (count: number, singular: string, plural: string) => {
      announceCount(count, singular, plural);
    },
    []
  );

  return announce;
}
