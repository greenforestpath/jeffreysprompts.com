"use client";

/**
 * useOnboarding - Unified onboarding state management for hints and tooltips.
 *
 * Manages one-time display of contextual hints across the app.
 * Persists state to localStorage so users only see hints once.
 * Coordinates hint display to avoid overwhelming new users.
 */

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

/** Available onboarding hint IDs */
export type OnboardingHintId =
  | "swipe-gestures"      // Swipe left/right on prompt cards
  | "double-tap"          // Double-tap to save
  | "long-press"          // Long-press for quick actions
  | "spotlight-search"    // Cmd+K spotlight search
  | "keyboard-shortcuts"  // ? for keyboard help
  | "filters"             // Category and tag filters
  | "basket"              // Basket functionality
  | "theme-toggle";       // Dark/light mode toggle

/** State for a single hint */
interface HintState {
  dismissed: boolean;
  dismissedAt: string | null;
}

/** Full onboarding state */
interface OnboardingState {
  hints: Record<OnboardingHintId, HintState>;
  firstVisit: boolean;
  firstVisitAt: string | null;
}

const STORAGE_KEY = "jfp-onboarding";

const DEFAULT_HINT_STATE: HintState = {
  dismissed: false,
  dismissedAt: null,
};

const DEFAULT_STATE: OnboardingState = {
  hints: {
    "swipe-gestures": DEFAULT_HINT_STATE,
    "double-tap": DEFAULT_HINT_STATE,
    "long-press": DEFAULT_HINT_STATE,
    "spotlight-search": DEFAULT_HINT_STATE,
    "keyboard-shortcuts": DEFAULT_HINT_STATE,
    "filters": DEFAULT_HINT_STATE,
    "basket": DEFAULT_HINT_STATE,
    "theme-toggle": DEFAULT_HINT_STATE,
  },
  firstVisit: true,
  firstVisitAt: null,
};

/** Result of the useOnboarding hook */
export interface UseOnboardingResult {
  /** Check if a specific hint should be shown */
  shouldShowHint: (hintId: OnboardingHintId) => boolean;
  /** Dismiss a specific hint permanently */
  dismissHint: (hintId: OnboardingHintId) => void;
  /** Reset a specific hint to show again */
  resetHint: (hintId: OnboardingHintId) => void;
  /** Reset all hints (for testing) */
  resetAll: () => void;
  /** Whether this is the user's first visit */
  isFirstVisit: boolean;
  /** Mark first visit as completed */
  completeFirstVisit: () => void;
  /** Get all hint states */
  hintStates: Record<OnboardingHintId, HintState>;
}

/**
 * useOnboarding - Hook for managing onboarding hint display.
 *
 * @example
 * ```tsx
 * function SpotlightSearch() {
 *   const { shouldShowHint, dismissHint } = useOnboarding();
 *
 *   return (
 *     <>
 *       <SearchInput />
 *       {shouldShowHint("spotlight-search") && (
 *         <OnboardingTooltip
 *           hint="spotlight-search"
 *           message="Press Cmd+K to quickly search prompts"
 *           onDismiss={() => dismissHint("spotlight-search")}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useOnboarding(): UseOnboardingResult {
  const [state, setState] = useLocalStorage<OnboardingState>(
    STORAGE_KEY,
    DEFAULT_STATE,
    { debounceMs: 0 } // Immediate write for dismissals
  );

  const shouldShowHint = useCallback(
    (hintId: OnboardingHintId): boolean => {
      const hintState = state.hints[hintId];
      return hintState ? !hintState.dismissed : true;
    },
    [state.hints]
  );

  const dismissHint = useCallback(
    (hintId: OnboardingHintId) => {
      setState((prev) => ({
        ...prev,
        hints: {
          ...prev.hints,
          [hintId]: {
            dismissed: true,
            dismissedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [setState]
  );

  const resetHint = useCallback(
    (hintId: OnboardingHintId) => {
      setState((prev) => ({
        ...prev,
        hints: {
          ...prev.hints,
          [hintId]: DEFAULT_HINT_STATE,
        },
      }));
    },
    [setState]
  );

  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
  }, [setState]);

  const completeFirstVisit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      firstVisit: false,
      firstVisitAt: prev.firstVisitAt || new Date().toISOString(),
    }));
  }, [setState]);

  const hintStates = useMemo(() => state.hints, [state.hints]);

  return {
    shouldShowHint,
    dismissHint,
    resetHint,
    resetAll,
    isFirstVisit: state.firstVisit,
    completeFirstVisit,
    hintStates,
  };
}

export default useOnboarding;
