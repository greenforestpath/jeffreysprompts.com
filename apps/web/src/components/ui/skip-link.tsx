"use client";

import { cn } from "@/lib/utils";

interface SkipLinkProps {
  /** The target element ID to skip to (without #) */
  targetId?: string;
  /** Custom text for the link */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skip link component for WCAG 2.4.1 (Bypass Blocks)
 *
 * Provides a way for keyboard users to skip navigation and jump to main content.
 * The link is visually hidden until focused.
 *
 * @example
 * ```tsx
 * // In layout.tsx, before Nav
 * <SkipLink targetId="main-content" />
 * <Nav />
 * <main id="main-content">...</main>
 * ```
 */
export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // Make the target focusable if it isn't
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visually hidden by default
        "sr-only",
        // Visible when focused
        "focus:not-sr-only focus:absolute focus:z-[100]",
        "focus:top-4 focus:left-4",
        "focus:px-4 focus:py-2",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-md focus:font-medium",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "focus:outline-none",
        // Transition for smooth appearance
        "transition-all duration-150",
        className
      )}
    >
      {children}
    </a>
  );
}
