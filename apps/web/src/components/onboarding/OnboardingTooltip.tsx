"use client";

/**
 * OnboardingTooltip - Contextual hint tooltip for first-time users.
 *
 * Features:
 * - Positioned relative to target element
 * - Animated entrance
 * - Dismissible with "Got it" button
 * - Auto-positions to avoid overflow
 * - Keyboard accessible
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, Keyboard, Hand, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipIcon = "lightbulb" | "keyboard" | "gesture" | "sparkles";

interface OnboardingTooltipProps {
  /** Whether the tooltip is visible */
  show: boolean;
  /** Callback when tooltip is dismissed */
  onDismiss: () => void;
  /** Main message to display */
  message: string;
  /** Optional secondary text */
  description?: string;
  /** Optional keyboard shortcut to display */
  shortcut?: string;
  /** Preferred position relative to target */
  position?: TooltipPosition;
  /** Icon to show */
  icon?: TooltipIcon;
  /** Custom dismiss button text */
  dismissText?: string;
  /** Optional className for positioning */
  className?: string;
  /** Whether to show an arrow pointing to target */
  showArrow?: boolean;
  /** Children to wrap (optional - for absolute positioning) */
  children?: ReactNode;
  /** Delay before showing (ms) */
  delay?: number;
}

const iconMap: Record<TooltipIcon, typeof Lightbulb> = {
  lightbulb: Lightbulb,
  keyboard: Keyboard,
  gesture: Hand,
  sparkles: Sparkles,
};

const iconColorMap: Record<TooltipIcon, string> = {
  lightbulb: "text-amber-500",
  keyboard: "text-indigo-500",
  gesture: "text-sky-500",
  sparkles: "text-pink-500",
};

const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
  left: "right-full top-1/2 -translate-y-1/2 mr-3",
  right: "left-full top-1/2 -translate-y-1/2 ml-3",
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-neutral-900 dark:border-t-neutral-100 border-l-transparent border-r-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900 dark:border-b-neutral-100 border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-neutral-900 dark:border-l-neutral-100 border-t-transparent border-b-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-neutral-900 dark:border-r-neutral-100 border-t-transparent border-b-transparent border-l-transparent",
};

/**
 * OnboardingTooltip - Displays a one-time hint for new users.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <SearchButton />
 *   <OnboardingTooltip
 *     show={shouldShowHint("spotlight-search")}
 *     onDismiss={() => dismissHint("spotlight-search")}
 *     message="Quick search"
 *     description="Press Cmd+K to search prompts instantly"
 *     shortcut="Cmd+K"
 *     icon="keyboard"
 *     position="bottom"
 *   />
 * </div>
 * ```
 */
export function OnboardingTooltip({
  show,
  onDismiss,
  message,
  description,
  shortcut,
  position = "bottom",
  icon = "lightbulb",
  dismissText = "Got it",
  className,
  showArrow = true,
  children,
  delay = 500,
}: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delay showing to avoid flashing on quick interactions
  useEffect(() => {
    if (show) {
      timeoutRef.current = setTimeout(() => {
        setVisible(true);
      }, delay);
    } else {
      setVisible(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, delay]);

  const Icon = iconMap[icon];
  const iconColor = iconColorMap[icon];

  const content = (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : position === "bottom" ? -10 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute z-50",
            positionClasses[position],
            className
          )}
          role="tooltip"
          aria-live="polite"
        >
          <div className="relative">
            {/* Tooltip content */}
            <div
              className={cn(
                "px-4 py-3 rounded-xl shadow-lg",
                "bg-neutral-900 dark:bg-neutral-100",
                "text-white dark:text-neutral-900",
                "max-w-[280px] min-w-[200px]"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn("flex-shrink-0 mt-0.5", iconColor)}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{message}</p>
                  {description && (
                    <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                      {description}
                    </p>
                  )}
                  {shortcut && (
                    <kbd className="mt-2 inline-block px-2 py-0.5 rounded bg-white/10 dark:bg-black/10 font-mono text-xs">
                      {shortcut}
                    </kbd>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={onDismiss}
                  className={cn(
                    "flex-shrink-0 p-1 rounded-lg",
                    "hover:bg-white/10 dark:hover:bg-black/10",
                    "transition-colors"
                  )}
                  aria-label="Dismiss hint"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dismiss button */}
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onDismiss}
                  className="text-xs px-3 py-1.5 h-auto bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 border-0"
                >
                  {dismissText}
                </Button>
              </div>
            </div>

            {/* Arrow */}
            {showArrow && (
              <div
                className={cn(
                  "absolute w-0 h-0",
                  "border-8",
                  arrowClasses[position]
                )}
                aria-hidden="true"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // If children provided, wrap them
  if (children) {
    return (
      <div className="relative">
        {children}
        {content}
      </div>
    );
  }

  return content;
}

export default OnboardingTooltip;
