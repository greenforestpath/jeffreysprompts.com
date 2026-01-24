"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  Bug,
  Check,
  Copy,
  FileText,
  FlaskConical,
  GitBranch,
  Lightbulb,
  MessageCircle,
  Wrench,
  X,
} from "lucide-react";
import { prompts, categories } from "@jeffreysprompts/core/prompts/registry";
import type { Prompt, PromptCategory } from "@jeffreysprompts/core/prompts/types";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useToast } from "@/components/ui/toast";
import { copyToClipboard } from "@/lib/clipboard";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useIsSmallScreen } from "@/hooks/useIsMobile";

const categoryConfig: Record<
  PromptCategory,
  { icon: typeof Lightbulb; color: string; bg: string }
> = {
  ideation: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
  documentation: { icon: FileText, color: "text-sky-500", bg: "bg-sky-500/10" },
  automation: { icon: Bot, color: "text-violet-500", bg: "bg-violet-500/10" },
  refactoring: { icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  testing: { icon: FlaskConical, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  debugging: { icon: Bug, color: "text-rose-500", bg: "bg-rose-500/10" },
  workflow: { icon: GitBranch, color: "text-orange-500", bg: "bg-orange-500/10" },
  communication: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
};

export function PromptDeckOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isSmallScreen = useIsSmallScreen();
  const { success, error } = useToast();

  const categoryCounts = useMemo(() => {
    const counts: Record<PromptCategory, number> = {} as Record<PromptCategory, number>;
    for (const prompt of prompts) {
      counts[prompt.category] = (counts[prompt.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filteredPrompts = useMemo(() => {
    if (!selectedCategory) return prompts;
    return prompts.filter((prompt) => prompt.category === selectedCategory);
  }, [selectedCategory]);

  const closeDeck = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("jfp:open-prompt-deck", handleOpen as EventListener);
    return () => window.removeEventListener("jfp:open-prompt-deck", handleOpen as EventListener);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDeck();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDeck]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(
    async (prompt: Prompt) => {
      const result = await copyToClipboard(prompt.content);

      if (result.success) {
        setCopiedId(prompt.id);
        if ("vibrate" in navigator) {
          navigator.vibrate(40);
        }
        success("Copied prompt", prompt.title, { duration: 2500 });
        trackEvent("prompt_copy", { id: prompt.id, source: "deck" });

        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopiedId(null), 1500);
      } else {
        error("Failed to copy", "Please try again");
      }
    },
    [success, error]
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="prompt-deck-backdrop"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDeck}
            aria-hidden
          />
          <motion.div
            key="prompt-deck-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Prompt deck"
            className={cn(
              "fixed inset-0 z-50 flex",
              isSmallScreen ? "p-0" : "p-6"
            )}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className={cn(
                "relative w-full bg-background text-foreground",
                "border border-border/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]",
                isSmallScreen
                  ? "h-full rounded-none"
                  : "m-auto max-h-[calc(100vh-3rem)] max-w-6xl rounded-2xl"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Lightbulb className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Prompt Deck</h2>
                    <p className="text-sm text-muted-foreground">Click any tile to copy</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDeck}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  )}
                  aria-label="Close prompt deck"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 py-3 border-b border-border/50">
                <CategoryFilter
                  categories={categories}
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                  counts={categoryCounts}
                />
              </div>

              <div className="max-h-[calc(100vh-15rem)] overflow-y-auto px-5 py-5">
                {filteredPrompts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
                    No prompts match this category yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPrompts.map((prompt) => {
                      const config = categoryConfig[prompt.category];
                      const Icon = config.icon;
                      const isCopied = copiedId === prompt.id;
                      return (
                        <button
                          key={prompt.id}
                          type="button"
                          onClick={() => handleCopy(prompt)}
                          className={cn(
                            "group text-left rounded-2xl border border-border/60 bg-card p-4",
                            "transition-all duration-150 ease-out",
                            "hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_24px_-16px_rgba(0,0,0,0.35)]",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            isCopied && "border-primary/60 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
                          )}
                          aria-label={`Copy ${prompt.title}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", config.bg)}>
                                <Icon className={cn("h-5 w-5", config.color)} aria-hidden="true" />
                              </span>
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {prompt.category}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-full text-xs",
                                isCopied ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                              )}
                              aria-hidden="true"
                            >
                              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-3.5 w-3.5" />}
                            </span>
                          </div>
                          <div className="mt-4 space-y-2">
                            <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2">
                              {prompt.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {prompt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
                <span>{filteredPrompts.length} prompts</span>
                <span>Shortcut: Cmd+Shift+P</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default PromptDeckOverlay;
