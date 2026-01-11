"use client";

import { Suspense, useMemo, useCallback, useState, useEffect } from "react";
import { AlertTriangle, Sparkles, ChevronDown, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { prompts, categories, tags } from "@jeffreysprompts/core/prompts/registry";
import { searchPrompts } from "@jeffreysprompts/core/search/engine";
import { Hero } from "@/components/Hero";
import { PromptGrid } from "@/components/PromptGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TagFilter } from "@/components/TagFilter";
import { PromptDetailModal } from "@/components/PromptDetailModal";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useFilterState } from "@/hooks/useFilterState";
import { trackEvent } from "@/lib/analytics";
import { toast } from "@/components/ui/toast";
import {
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  PricingPreviewSection,
  FinalCtaSection,
} from "@/components/landing";
import type { Prompt, PromptCategory } from "@jeffreysprompts/core/prompts/types";

function PromptGridFallback({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-destructive mb-2">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">Something went wrong loading prompts.</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Try refreshing the page to reload the prompt list.
      </p>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        Refresh
      </Button>
    </div>
  );
}

function HomeContent() {
  const { filters, setQuery, setCategory, setTags, clearFilters, hasActiveFilters } =
    useFilterState();

  // Modal state for viewing prompt details
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<PromptCategory, number> = {} as Record<PromptCategory, number>;
    for (const prompt of prompts) {
      counts[prompt.category] = (counts[prompt.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  // Compute tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const prompt of prompts) {
      for (const tag of prompt.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    return counts;
  }, []);

  // Filter prompts based on search, category, and tags
  const filteredPrompts = useMemo(() => {
    let results: Prompt[];

    if (filters.query.trim()) {
      const searchResults = searchPrompts(filters.query, {
        category: filters.category ?? undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        limit: 50,
      });
      results = searchResults.map((r) => r.prompt);
    } else {
      results = [...prompts];

      if (filters.category) {
        results = results.filter((p) => p.category === filters.category);
      }

      if (filters.tags.length > 0) {
        results = results.filter((p) =>
          filters.tags.some((tag) => p.tags.includes(tag))
        );
      }
    }

    return results;
  }, [filters]);

  useEffect(() => {
    const query = filters.query.trim();
    if (!query) return;
    const timer = setTimeout(() => {
      trackEvent("search", {
        queryLength: query.length,
        resultCount: filteredPrompts.length,
        source: "homepage",
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.query, filteredPrompts.length]);

  const handlePromptClick = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing selected prompt for exit animation
    setTimeout(() => setSelectedPrompt(null), 200);
  }, []);

  const handlePromptCopy = useCallback((prompt: Prompt) => {
    toast.success("Copied!", `"${prompt.title}" copied to clipboard`);
  }, []);

  const handleRefresh = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const scrollToPrompts = useCallback(() => {
    const promptsSection = document.getElementById("prompts-section");
    if (promptsSection) {
      promptsSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <Hero
        promptCount={prompts.length}
        categoryCount={categories.length}
        categories={categories}
        onSearch={setQuery}
        onCategorySelect={setCategory}
        selectedCategory={filters.category}
      />

      {/* Marketing Sections */}
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingPreviewSection />

      {/* Transition to Prompt Browser */}
      <section className="py-16 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Ready to explore?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-xl mx-auto">
              Browse our curated collection of {prompts.length} battle-tested prompts below.
            </p>
            <Button
              size="lg"
              onClick={scrollToPrompts}
              className="gap-2"
            >
              Browse Prompts
              <ArrowDown className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Prompt Browser Section */}
      <main id="prompts-section" className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selected={filters.category}
              onChange={setCategory}
              counts={categoryCounts}
            />

            {/* Clear all filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Tag Filter */}
          <TagFilter
            tags={tags}
            selected={filters.tags}
            onChange={setTags}
            counts={tagCounts}
            maxVisible={12}
          />
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {filters.category ? (
                <span className="capitalize">{filters.category}</span>
              ) : filters.query ? (
                "Search Results"
              ) : (
                "All Prompts"
              )}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""}
              {filters.query && ` for "${filters.query}"`}
              {filters.tags.length > 0 && ` with tags: ${filters.tags.join(", ")}`}
            </p>
          </div>
        </div>

        {/* Prompt Grid */}
        <ErrorBoundary fallback={<PromptGridFallback onRefresh={handleRefresh} />}>
          <PromptGrid
            prompts={filteredPrompts}
            onPromptClick={handlePromptClick}
            onPromptCopy={handlePromptCopy}
          />
        </ErrorBoundary>
      </main>

      {/* Pro Teaser & FAQ Section */}
      <section className="border-t dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
        <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Pro Teaser */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex-shrink-0 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
                  Pro mode (optional)
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Keep your favorites, add notes, and access early prompts. Everything on the public site stays free and open-source.
                </p>
              </div>
              <a
                href="https://pro.jeffreysprompts.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
              >
                See Pro features
              </a>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Frequently Asked Questions
              </h3>
              <details className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <span>Is the public site free and open-source?</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Yes. The core prompt library and browsing experience are completely free and{" "}
                  <a
                    href="https://github.com/Dicklesworthstone/jeffreysprompts.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    open-source
                  </a>
                  . Pro is optional and adds personal features like bookmarks, notes, and early-access prompts.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCtaSection />

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        open={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <HomeContent />
    </Suspense>
  );
}
