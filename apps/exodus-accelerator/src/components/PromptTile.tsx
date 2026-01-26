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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: Math.min(index * 0.03, 0.3),
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
            "relative w-full text-left rounded-2xl p-5",
            "border border-border/60 bg-card",
            "transition-all duration-200 ease-out cursor-pointer",
            "hover:-translate-y-1 hover:border-border",
            "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]",
            "dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isCopied && [
              "border-primary/60 ring-2 ring-primary/20",
              "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]",
            ]
          )}
        >
          {/* Number badge - shows keyboard shortcut */}
          {displayNumber <= 9 && (
            <div className="number-badge group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              {displayNumber}
            </div>
          )}

          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <motion.span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  config.bg,
                  "transition-shadow duration-300",
                  "group-hover:shadow-lg",
                  config.glow
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={cn("h-6 w-6", config.color)} />
              </motion.span>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {prompt.category}
                </span>
                {usageCount > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums">
                    {usageCount} {usageCount === 1 ? "use" : "uses"}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <motion.button
                type="button"
                onClick={handleInfo}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "text-muted-foreground/60 hover:text-muted-foreground",
                  "hover:bg-muted/60 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                aria-label="View prompt details"
              >
                <Info className="h-4 w-4" />
              </motion.button>

              <motion.button
                type="button"
                onClick={handleCopy}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  isCopied
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/60",
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
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2 pr-2">
              {prompt.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Bottom accent line (shows on hover) */}
          <div
            className={cn(
              "absolute bottom-0 left-4 right-4 h-0.5 rounded-full",
              "transform scale-x-0 group-hover:scale-x-100",
              "transition-transform duration-300 origin-left",
              config.bg.replace("/10", "")
            )}
          />
        </div>
      </motion.div>

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
