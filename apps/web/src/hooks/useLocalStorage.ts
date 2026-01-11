"use client";

/**
 * useLocalStorage - Generic localStorage persistence hook
 *
 * WHEN TO USE THIS HOOK:
 * - Simple boolean flags (e.g., "user dismissed welcome banner")
 * - One-off primitive values that don't need global state
 * - Values that aren't shared between components
 *
 * WHEN TO USE TANSTACK STORE INSTEAD:
 * - Complex state objects (reading positions, user preferences)
 * - State shared across multiple components
 * - State that needs actions/reducers pattern
 *
 * EXISTING STORES (use these instead of this hook):
 * - readingStore: Document reading positions (@/stores/readingStore)
 *
 * @see @/hooks/useReadingPosition for the TanStack Store-based pattern
 */

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type MutableRefObject,
} from "react";

/**
 * Hook for persisting state to localStorage with SSR safety.
 * Includes debounced writes for performance.
 *
 * @param key - localStorage key
 * @param initialValue - Default value if nothing in storage
 * @param options - Configuration options
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: { debounceMs?: number } = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { debounceMs = 300 } = options;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialValueRef = useRef<T>(initialValue);
  const latestValueRef: MutableRefObject<T> = useRef<T>(initialValue);
  const latestKeyRef = useRef<string>(key);
  const hasLatestValueRef = useRef(false);
  const prevKeyRef = useRef<string>(key);
  const listenersRef = useRef(new Set<() => void>());

  // Keep initialValueRef updated for resets without re-running effects every render
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Flush pending writes when switching keys
  useEffect(() => {
    const oldKey = prevKeyRef.current;
    if (oldKey !== key && debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      if (hasLatestValueRef.current) {
        try {
          window.localStorage.setItem(oldKey, JSON.stringify(latestValueRef.current));
        } catch {
          // Ignore errors on key-change flush
        }
      }
    }
    prevKeyRef.current = key;
    latestKeyRef.current = key;
    hasLatestValueRef.current = false;
  }, [key]);

  const notifyListeners = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const readValue = useCallback((): T => {
    if (hasLatestValueRef.current && latestKeyRef.current === key) {
      return latestValueRef.current;
    }
    if (typeof window === "undefined") return initialValueRef.current;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
      return initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const subscribe = useCallback(
    (listener: () => void) => {
      listenersRef.current.add(listener);
      if (typeof window === "undefined") {
        return () => listenersRef.current.delete(listener);
      }
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
          hasLatestValueRef.current = false;
          listener();
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => {
        listenersRef.current.delete(listener);
        window.removeEventListener("storage", handleStorage);
      };
    },
    [key]
  );

  const storedValue = useSyncExternalStore(
    subscribe,
    readValue,
    () => initialValueRef.current
  );

  // Setter with debounced persistence
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const valueToStore = value instanceof Function ? value(readValue()) : value;
      latestValueRef.current = valueToStore;
      latestKeyRef.current = key;
      hasLatestValueRef.current = true;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
      }, debounceMs);

      notifyListeners();
    },
    [key, debounceMs, readValue, notifyListeners]
  );

  // Remove from storage
  const removeValue = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    try {
      window.localStorage.removeItem(key);
      latestValueRef.current = initialValueRef.current;
      latestKeyRef.current = key;
      hasLatestValueRef.current = true;
      notifyListeners();
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, notifyListeners]);

  // Persist on unmount if there's a pending debounce
  // NOTE: Only depends on `key`, NOT `storedValue` - we use latestValueRef to avoid
  // the stale closure bug where cleanup would write old values on every state change
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        // Use ref to get the actual latest value, not a stale closure
        if (hasLatestValueRef.current) {
          try {
            window.localStorage.setItem(key, JSON.stringify(latestValueRef.current));
          } catch {
            // Ignore errors on cleanup
          }
        }
      }
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}
