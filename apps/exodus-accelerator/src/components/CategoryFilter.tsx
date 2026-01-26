"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { PromptCategory } from "@jeffreysprompts/core/prompts/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: PromptCategory[];
  selected: PromptCategory | null;
  onChange: (category: PromptCategory | null) => void;
  counts?: Record<PromptCategory, number>;
}

export function CategoryFilter({ categories, selected, onChange, counts }: CategoryFilterProps) {
  const totalCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap items-center gap-2"
    >
      <motion.button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onChange(null)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium",
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          selected === null
            ? "bg-foreground text-background shadow-lg"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        All
        {counts && (
          <span className={cn(
            "text-xs tabular-nums",
            selected === null ? "text-background/70" : "text-muted-foreground/60"
          )}>
            {totalCount}
          </span>
        )}
      </motion.button>

      {categories.map((category) => (
        <motion.button
          key={category}
          type="button"
          aria-pressed={selected === category}
          onClick={() => onChange(category)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium capitalize",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            selected === category
              ? "bg-foreground text-background shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {category}
          {counts?.[category] !== undefined && (
            <span className={cn(
              "text-xs tabular-nums",
              selected === category ? "text-background/70" : "text-muted-foreground/60"
            )}>
              {counts[category]}
            </span>
          )}
        </motion.button>
      ))}

      {selected && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted/60 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          aria-label="Clear filter"
        >
          <X className="size-3" />
          Clear
        </motion.button>
      )}
    </div>
  );
}
