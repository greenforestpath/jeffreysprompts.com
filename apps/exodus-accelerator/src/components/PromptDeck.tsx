"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X, Loader2, Plus, Lightbulb } from "lucide-react";
import type { Prompt, PromptCategory } from "@jeffreysprompts/core/prompts/types";
import { type UsageEvent } from "@/lib/usage";
import { PromptTile } from "./PromptTile";
import { CategoryFilter } from "./CategoryFilter";
import { PromptEditor } from "./PromptEditor";
import { SuggestionsPane } from "./SuggestionsPane";
import { cn } from "@/lib/utils";

// All valid categories (for filter UI)
const ALL_CATEGORIES: PromptCategory[] = [
  "ideation",
  "documentation",
  "automation",
  "refactoring",
  "testing",
  "debugging",
  "workflow",
  "communication",
];

export function PromptDeck() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>(undefined);

  // View state: prompts or suggestions
  const [activeView, setActiveView] = useState<"prompts" | "suggestions">("prompts");
  const [suggestionCount, setSuggestionCount] = useState(0);

  // Load prompts from API
  useEffect(() => {
    fetch("/api/prompts")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPrompts(data.prompts || []);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  // Load usage data on mount
  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((events) => setUsageEvents(events))
      .catch(console.error);
  }, []);

  // Load suggestion count
  const loadSuggestionCount = useCallback(() => {
    fetch("/api/prompts/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestionCount(data.pending || 0))
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadSuggestionCount();
  }, [loadSuggestionCount]);

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

  // Reload prompts
  const reloadPrompts = useCallback(() => {
    fetch("/api/prompts")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPrompts(data.prompts || []);
      });
  }, []);

  // Editor handlers
  const handleCreateNew = () => {
    setEditingPrompt(undefined);
    setEditorOpen(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditorOpen(true);
  };

  const handleClone = (prompt: Prompt) => {
    // Clone opens editor in create mode with pre-filled data
    setEditingPrompt({
      ...prompt,
      id: "", // Clear ID to trigger create mode
      title: `${prompt.title} (Copy)`,
      version: "1.0.0",
      created: new Date().toISOString().split("T")[0],
    });
    setEditorOpen(true);
  };

  const handleSave = async (prompt: Prompt) => {
    // Clone mode: editingPrompt exists but has empty id
    const isNew = !editingPrompt || !editingPrompt.id;
    const url = isNew ? "/api/prompts" : `/api/prompts?id=${prompt.id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    });

    const data = await res.json();
    if (!res.ok) {
      throw { errors: data.details || [data.error] };
    }

    reloadPrompts();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/prompts?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    reloadPrompts();
  };

  // Handle editing a suggestion - opens editor with parsed content
  const handleEditSuggestion = (slug: string, content: string) => {
    // Parse frontmatter from markdown content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) return;

    const frontmatter = frontmatterMatch[1];
    const promptContent = frontmatterMatch[2].trim();

    // Extract fields from frontmatter
    const getValue = (key: string): string => {
      const match = frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?`, "m"));
      return match ? match[1] : "";
    };

    const getList = (key: string): string[] => {
      const match = frontmatter.match(new RegExp(`^${key}:\\s*\\n([\\s\\S]*?)(?=\\n\\w|$)`, "m"));
      if (!match) return [];
      return match[1].split("\n").filter(l => l.trim().startsWith("-")).map(l => l.replace(/^\s*-\s*["']?([^"']*)["']?$/, "$1"));
    };

    // Create a prompt object for the editor
    const suggestionPrompt: Prompt = {
      id: "", // Empty ID for create mode
      title: getValue("title"),
      description: getValue("description"),
      category: getValue("category") as PromptCategory || "workflow",
      version: getValue("version") || "1.0.0",
      content: promptContent,
      tags: getList("tags"),
      whenToUse: getList("whenToUse"),
      tips: getList("tips"),
      created: new Date().toISOString().split("T")[0],
      author: getValue("author") || "AI Generated",
    };

    setEditingPrompt(suggestionPrompt);
    setEditorOpen(true);
  };

  // Derive categories that have prompts
  const categories = useMemo(() => {
    const found = new Set(prompts.map((p) => p.category));
    return ALL_CATEGORIES.filter((c) => found.has(c));
  }, [prompts]);

  const categoryCounts = useMemo(() => {
    const counts: Record<PromptCategory, number> = {} as Record<PromptCategory, number>;
    for (const prompt of prompts) {
      counts[prompt.category] = (counts[prompt.category] ?? 0) + 1;
    }
    return counts;
  }, [prompts]);

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
  }, [prompts, selectedCategory, searchQuery]);

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

            {/* Tabs + Add + Stats */}
            <div className="flex items-center gap-4">
              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04]">
                <button
                  onClick={() => setActiveView("prompts")}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                    activeView === "prompts"
                      ? "bg-white/[0.08] text-white/90"
                      : "text-white/40 hover:text-white/60"
                  )}
                >
                  Prompts
                </button>
                <button
                  onClick={() => setActiveView("suggestions")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors",
                    activeView === "suggestions"
                      ? "bg-white/[0.08] text-white/90"
                      : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Suggestions
                  {suggestionCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/20 text-amber-400">
                      {suggestionCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={handleCreateNew}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                  "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20",
                  "transition-colors duration-200"
                )}
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
              <div className="text-[12px] text-white/40 tabular-nums">
                {isLoading ? "..." : `${filteredPrompts.length} prompts`}
              </div>
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

      {/* Main content */}
      <main className="flex-1 py-4 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {activeView === "suggestions" ? (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SuggestionsPane
                  onEditSuggestion={handleEditSuggestion}
                  onRefreshPrompts={() => {
                    reloadPrompts();
                    loadSuggestionCount();
                  }}
                />
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
                <div className="mt-3 text-white/30 text-sm">Loading prompts...</div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="text-red-400/80 text-sm">Error: {error}</div>
              </motion.div>
            ) : filteredPrompts.length === 0 ? (
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
                    onEdit={() => handleEdit(prompt)}
                    onClone={() => handleClone(prompt)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Prompt Editor Modal */}
      <PromptEditor
        prompt={editingPrompt}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
