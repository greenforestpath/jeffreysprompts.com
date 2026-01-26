"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Info,
  Lightbulb,
  FileText,
  Bot,
  Wrench,
  FlaskConical,
  Bug,
  GitBranch,
  MessageCircle,
} from "lucide-react";
import type { Prompt, PromptCategory } from "@jeffreysprompts/core/prompts/types";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/clipboard";
import { trackUsage } from "@/lib/usage";
import { useToast } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PromptDetailModal } from "./PromptDetailModal";

const categoryConfig: Record<PromptCategory, { icon: typeof Lightbulb; color: string; bg: string; glow: string }> = {
  ideation: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", glow: "shadow-amber-500/20" },
  documentation: { icon: FileText, color: "text-sky-500", bg: "bg-sky-500/10", glow: "shadow-sky-500/20" },
  automation: { icon: Bot, color: "text-violet-500", bg: "bg-violet-500/10", glow: "shadow-violet-500/20" },
  refactoring: { icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20" },
  testing: { icon: FlaskConical, color: "text-cyan-500", bg: "bg-cyan-500/10", glow: "shadow-cyan-500/20" },
  debugging: { icon: Bug, color: "text-rose-500", bg: "bg-rose-500/10", glow: "shadow-rose-500/20" },
  workflow: { icon: GitBranch, color: "text-orange-500", bg: "bg-orange-500/10", glow: "shadow-orange-500/20" },
  communication: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10", glow: "shadow-blue-500/20" },
};

interface PromptTileProps {
  prompt: Prompt;
  index: number;
  usageCount?: number;
}

export function PromptTile({ prompt, index, usageCount = 0 }: PromptTileProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  const config = categoryConfig[prompt.category];
  const Icon = config.icon;
  const displayNumber = index + 1;

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    const result = await copyToClipboard(prompt.content);

    if (result.success) {
      setIsCopied(true);
      if ("vibrate" in navigator) navigator.vibrate(40);
      success("Copied!", prompt.title);
      trackUsage(prompt.id, prompt.category);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      error("Failed to copy", "Please try again");
    }
  }, [prompt, success, error]);

  const handleInfo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCopy(e as unknown as React.MouseEvent);
    }
    if (e.key === "i") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  }, [handleCopy]);

  return (
    <>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: Math.min(index * 0.02, 0.2),
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="relative group"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handleCopy}
              onKeyDown={handleKeyDown}
              className={cn(
                "relative w-full text-left rounded-xl p-3",
                "border border-border/50 bg-card",
                "transition-all duration-150 ease-out cursor-pointer",
                "hover:-translate-y-0.5 hover:border-border",
                "hover:shadow-md dark:hover:shadow-lg",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isCopied && [
                  "border-primary/60 ring-1 ring-primary/20",
                  "shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]",
                ]
              )}
            >
              {/* Number badge - keyboard shortcut */}
              {displayNumber <= 9 && (
                <div className="number-badge">
                  {displayNumber}
                </div>
              )}

              {/* Compact single-row layout */}
              <div className="flex items-center gap-2.5 pl-6">
                {/* Icon */}
                <motion.span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    config.bg,
                    "transition-shadow duration-200",
                    "group-hover:shadow-md",
                    config.glow
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={cn("h-4 w-4", config.color)} />
                </motion.span>

                {/* Title - single line, truncated */}
                <h3 className="flex-1 text-sm font-medium leading-tight text-foreground truncate pr-1">
                  {prompt.title}
                </h3>

                {/* Action buttons - always visible on right */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <motion.button
                    type="button"
                    onClick={handleInfo}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      "text-muted-foreground/50 hover:text-muted-foreground",
                      "hover:bg-muted/60 transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                    aria-label="View prompt details"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleCopy}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      isCopied
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60",
                      "transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                    aria-label={isCopied ? "Copied" : "Copy prompt"}
                  >
                    {isCopied ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase tracking-wide font-medium">{prompt.category}</span>
              {usageCount > 0 && (
                <>
                  <span>·</span>
                  <span className="tabular-nums">{usageCount} {usageCount === 1 ? "use" : "uses"}</span>
                </>
              )}
            </div>
            <p className="text-sm leading-relaxed">{prompt.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>

      <PromptDetailModal
        prompt={prompt}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCopy={handleCopy}
        isCopied={isCopied}
      />
    </>
  );
}
