"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, BarChart3 } from "lucide-react";
import { prompts, categories } from "@jeffreysprompts/core/prompts/registry";
import type { PromptCategory } from "@jeffreysprompts/core/prompts/types";
import { copyToClipboard } from "@/lib/clipboard";
import { trackUsage, computeUsageCounts, type UsageEvent } from "@/lib/usage";
import { useToast } from "@/components/ui/toast";
import { PromptTile } from "./PromptTile";
import { CategoryFilter } from "./CategoryFilter";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function PromptDeck() {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const { success } = useToast();

  // Load usage data on mount
  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((events) => setUsageEvents(events))
      .catch(console.error);
  }, []);

  // Compute counts and category totals
  const usageCounts = useMemo(() => computeUsageCounts(usageEvents), [usageEvents]);

  const categoryCounts = useMemo(() => {
    const counts: Record<PromptCategory, number> = {} as Record<PromptCategory, number>;
    for (const prompt of prompts) {
      counts[prompt.category] = (counts[prompt.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filteredPrompts = useMemo(() => {
    if (!selectedCategory) return prompts;
    return prompts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const totalCopies = usageEvents.length;

  // Keyboard shortcut handler - press 1-9 to copy prompts
  const handleKeyboardShortcut = useCallback(async (e: KeyboardEvent) => {
    // Only handle number keys 1-9, and not when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 9 && num <= filteredPrompts.length) {
      const prompt = filteredPrompts[num - 1];
      const result = await copyToClipboard(prompt.content);
      if (result.success) {
        success("Copied!", prompt.title);
        trackUsage(prompt.id, prompt.category);
        // Update local state
        setUsageEvents((prev) => [
          ...prev,
          { prompt_id: prompt.id, ts: Date.now(), category: prompt.category },
        ]);
        if ("vibrate" in navigator) navigator.vibrate(40);
      }
    }
  }, [filteredPrompts, success]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  "bg-gradient-to-br from-violet-500 to-purple-600",
                  "shadow-lg shadow-violet-500/25"
                )}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Exodus Accelerator</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Press 1-9 to quick copy
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2",
                  "bg-muted/60 hover:bg-muted text-sm font-medium",
                  "transition-colors"
                )}
              >
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Analysis</span>
              </motion.button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="sticky top-[73px] z-30 glass border-b border-border/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={categoryCounts}
          />
        </div>
      </div>

      {/* Main grid */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-[1800px] mx-auto">
          {filteredPrompts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-8 py-16 text-center"
            >
              <p className="text-muted-foreground">
                No prompts match this category yet.
              </p>
            </motion.div>
          ) : (
            <div className="prompt-grid">
              {filteredPrompts.map((prompt, index) => (
                <PromptTile
                  key={prompt.id}
                  prompt={prompt}
                  index={index}
                  usageCount={usageCounts.get(prompt.id) ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer stats */}
      <footer className="sticky bottom-0 z-40 glass border-t border-border/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground tabular-nums">{filteredPrompts.length}</strong> prompts
              {selectedCategory && (
                <span className="ml-1">
                  in <span className="capitalize">{selectedCategory}</span>
                </span>
              )}
            </span>
            <span>
              <strong className="text-foreground tabular-nums">{totalCopies}</strong> total copies
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
