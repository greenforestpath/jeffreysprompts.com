"use client";

import { motion } from "framer-motion";
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
      className="flex items-center gap-1 overflow-x-auto scrollbar-hide"
    >
      <FilterButton
        active={selected === null}
        onClick={() => onChange(null)}
        count={counts ? totalCount : undefined}
      >
        All
      </FilterButton>

      {categories.map((category) => (
        <FilterButton
          key={category}
          active={selected === category}
          onClick={() => onChange(category)}
          count={counts?.[category]}
        >
          {category}
        </FilterButton>
      ))}
    </div>
  );
}

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count?: number;
}

function FilterButton({ children, active, onClick, count }: FilterButtonProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5",
        "text-[12px] font-medium capitalize whitespace-nowrap",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-500",
        active
          ? "text-white bg-white/[0.08]"
          : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn(
          "text-[10px] tabular-nums",
          active ? "text-white/50" : "text-white/25"
        )}>
          {count}
        </span>
      )}
    </motion.button>
  );
}
