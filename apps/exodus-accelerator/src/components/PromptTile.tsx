"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ChevronRight,
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

const categoryConfig: Record<PromptCategory, { icon: typeof Lightbulb; color: string; bg: string }> = {
  ideation: { icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10" },
  documentation: { icon: FileText, color: "text-sky-400", bg: "bg-sky-400/10" },
  automation: { icon: Bot, color: "text-violet-400", bg: "bg-violet-400/10" },
  refactoring: { icon: Wrench, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  testing: { icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  debugging: { icon: Bug, color: "text-rose-400", bg: "bg-rose-400/10" },
  workflow: { icon: GitBranch, color: "text-orange-400", bg: "bg-orange-400/10" },
  communication: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
};

interface PromptTileProps {
  prompt: Prompt;
  index: number;
  usageCount?: number;
}

export function PromptTile({ prompt, index, usageCount = 0 }: PromptTileProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  const config = categoryConfig[prompt.category];
  const Icon = config.icon;

  const handleCopy = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    const result = await copyToClipboard(prompt.content);

    if (result.success) {
      setIsCopied(true);
      if ("vibrate" in navigator) navigator.vibrate(40);
      success("Copied to clipboard", prompt.title);
      trackUsage(prompt.id, prompt.category);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      error("Failed to copy", "Please try again");
    }
  }, [prompt, success, error]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: Math.min(index * 0.025, 0.3),
          ease: [0.23, 1, 0.32, 1]
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative"
      >
        <motion.div
          role="button"
          tabIndex={0}
          onClick={handleCopy}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCopy();
            }
          }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative w-full text-left cursor-pointer",
            "rounded-xl p-4",
            "bg-white/[0.03] hover:bg-white/[0.06]",
            "border border-white/[0.06] hover:border-white/[0.1]",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
            isCopied && "border-emerald-500/40 bg-emerald-500/[0.05]"
          )}
        >
          {/* Main content */}
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              config.bg,
              "transition-transform duration-200",
              isHovered && "scale-105"
            )}>
              <Icon className={cn("h-4.5 w-4.5", config.color)} strokeWidth={1.5} />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-[13px] font-medium text-white/90 leading-tight mb-1 pr-6">
                {prompt.title}
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">
                {prompt.description}
              </p>
            </div>
          </div>

          {/* Hover actions */}
          <AnimatePresence>
            {isHovered && !isCopied && (
              <motion.div
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1"
              >
                <button
                  type="button"
                  onClick={handleViewDetails}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md",
                    "text-white/40 hover:text-white/70 hover:bg-white/[0.06]",
                    "transition-colors duration-150"
                  )}
                  aria-label="View details"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copy feedback */}
          <AnimatePresence>
            {isCopied && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/20">
                  <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category pill - subtle, bottom right */}
          <div className="absolute bottom-2 right-3">
            <span className={cn(
              "text-[9px] font-medium uppercase tracking-wider",
              "text-white/20 group-hover:text-white/30 transition-colors"
            )}>
              {prompt.category}
            </span>
          </div>
        </motion.div>
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
