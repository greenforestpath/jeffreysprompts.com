"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowUp, Bug, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PromptChange } from "@jeffreysprompts/core/prompts";

interface ChangelogAccordionProps {
  changelog: PromptChange[];
  className?: string;
}

const changeTypeConfig = {
  improvement: {
    icon: ArrowUp,
    label: "Improvement",
    badgeVariant: "default" as const,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  fix: {
    icon: Bug,
    label: "Fix",
    badgeVariant: "secondary" as const,
    color: "text-blue-600 dark:text-blue-400",
  },
  breaking: {
    icon: AlertTriangle,
    label: "Breaking",
    badgeVariant: "destructive" as const,
    color: "text-red-600 dark:text-red-400",
  },
};

/**
 * ChangelogAccordion - Displays version history for a prompt.
 * Collapsed by default, expands to show changes chronologically.
 */
export function ChangelogAccordion({ changelog, className }: ChangelogAccordionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!changelog || changelog.length === 0) {
    return null;
  }

  // Sort newest first
  const sortedChangelog = [...changelog].sort((a, b) => {
    // Sort by version descending (assuming semantic versioning)
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });

  return (
    <div className={cn("border-t pt-4 mt-4", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center gap-2",
          "text-left rounded-lg p-2 -m-2",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
          "transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
        aria-expanded={expanded}
      >
        <ChevronRight
          className={cn(
            "size-4 text-zinc-500 transition-transform duration-200",
            expanded && "rotate-90"
          )}
        />
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          What changed
        </span>
        <Badge variant="secondary" className="ml-2">
          {changelog.length} {changelog.length === 1 ? "version" : "versions"}
        </Badge>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-4">
              {sortedChangelog.map((entry) => {
                const config = changeTypeConfig[entry.type];
                const Icon = config.icon;

                return (
                  <li
                    key={entry.version}
                    className="pl-6 relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />

                    {/* Entry header */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={config.badgeVariant}>
                        v{entry.version}
                      </Badge>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatDate(entry.date)}
                      </span>
                      <span className={cn("flex items-center gap-1 text-xs", config.color)}>
                        <Icon className="size-3" />
                        {config.label}
                      </span>
                    </div>

                    {/* Change summary */}
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {entry.summary}
                    </p>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Format ISO date string for display.
 */
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate;
    }
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}
