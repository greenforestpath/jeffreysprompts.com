"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import { prompts, categories } from "@jeffreysprompts/core/prompts/registry";
import type { PromptCategory } from "@jeffreysprompts/core/prompts/types";
import { type UsageEvent } from "@/lib/usage";
import { PromptTile } from "./PromptTile";
import { CategoryFilter } from "./CategoryFilter";
import { cn } from "@/lib/utils";

export function PromptDeck() {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load usage data on mount
  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((events) => setUsageEvents(events))
      .catch(console.error);
  }, []);

  // Focus search on "/" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<PromptCategory, number> = {} as Record<PromptCategory, number>;
    for (const prompt of prompts) {
      counts[prompt.category] = (counts[prompt.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Sort alphabetically by title
    result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                "bg-gradient-to-br from-violet-500 to-purple-600"
              )}>
                <Sparkles className="h-4 w-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-[15px] font-semibold text-white/90">Exodus</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className={cn(
                    "w-full h-9 pl-9 pr-9 rounded-lg",
                    "bg-white/[0.04] border border-white/[0.06]",
                    "text-sm text-white/90 placeholder:text-white/30",
                    "focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.06]",
                    "transition-all duration-200"
                  )}
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-white/30 hover:text-white/60"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono">/</kbd>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="text-[12px] text-white/40 tabular-nums">
              {filteredPrompts.length} prompts
            </div>
          </div>
        </div>
      </header>

      {/* Category filter */}
      <div className="sticky top-14 z-40 border-b border-white/[0.04] bg-[#0a0a0b]/60 backdrop-blur-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={categoryCounts}
          />
        </div>
      </div>

      {/* Main grid */}
      <main className="flex-1 py-4 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {filteredPrompts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="text-white/20 text-sm">No prompts found</div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs text-violet-400 hover:text-violet-300"
                  >
                    Clear search
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prompt-grid"
              >
                {filteredPrompts.map((prompt, index) => (
                  <PromptTile
                    key={prompt.id}
                    prompt={prompt}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
