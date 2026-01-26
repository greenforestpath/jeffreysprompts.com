"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Info,
  Edit3,
  CopyPlus,
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
import { TooltipProvider, SimpleTooltip } from "@/components/ui/tooltip";

const categoryConfig: Record<PromptCategory, { icon: typeof Lightbulb; color: string; bg: string; glow: string }> = {
  ideation: { icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10", glow: "hover:shadow-amber-500/20" },
  documentation: { icon: FileText, color: "text-sky-400", bg: "bg-sky-400/10", glow: "hover:shadow-sky-500/20" },
  automation: { icon: Bot, color: "text-violet-400", bg: "bg-violet-400/10", glow: "hover:shadow-violet-500/20" },
  refactoring: { icon: Wrench, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "hover:shadow-emerald-500/20" },
  testing: { icon: FlaskConical, color: "text-cyan-400", bg: "bg-cyan-400/10", glow: "hover:shadow-cyan-500/20" },
  debugging: { icon: Bug, color: "text-rose-400", bg: "bg-rose-400/10", glow: "hover:shadow-rose-500/20" },
  workflow: { icon: GitBranch, color: "text-orange-400", bg: "bg-orange-400/10", glow: "hover:shadow-orange-500/20" },
  communication: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10", glow: "hover:shadow-blue-500/20" },
};

interface PromptTileProps {
  prompt: Prompt;
  index: number;
  usageCount?: number;
  onEdit?: () => void;
  onClone?: () => void;
}

export function PromptTile({ prompt, index, usageCount = 0, onEdit, onClone }: PromptTileProps) {
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

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  }, [onEdit]);

  const handleClone = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClone?.();
  }, [onClone]);

  return (
    <TooltipProvider>
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
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative w-full",
            "rounded-xl",
            "bg-white/[0.03] hover:bg-white/[0.05]",
            "border border-white/[0.06] hover:border-white/[0.12]",
            "transition-all duration-200 ease-out",
            "shadow-[0_0_0_0_transparent] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
            config.glow,
            isCopied && "border-emerald-500/40 bg-emerald-500/[0.04]"
          )}
        >
          {/* Main content area - clickable for copy */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleCopy}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCopy();
              }
            }}
            className={cn(
              "p-4 pb-14 cursor-pointer", // Extra padding at bottom for action bar
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-inset rounded-xl"
            )}
          >
            {/* Header with icon and title */}
            <div className="flex items-start gap-3">
              {/* Category icon */}
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                config.bg,
                "transition-all duration-300",
                isHovered && "scale-105"
              )}>
                <Icon className={cn("h-5 w-5", config.color)} strokeWidth={1.5} />
              </div>

              {/* Title and description */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-[13px] font-semibold text-white/90 leading-tight mb-1.5">
                  {prompt.title}
                </h3>
                <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">
                  {prompt.description}
                </p>
              </div>
            </div>
          </div>

          {/* Action bar - always visible at bottom, more prominent on hover */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0",
            "flex items-center justify-between",
            "px-3 py-2.5",
            "border-t border-white/[0.04]",
            "bg-gradient-to-t from-white/[0.02] to-transparent",
            "transition-all duration-200"
          )}>
            {/* Category label */}
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              "text-white/25 group-hover:text-white/35 transition-colors"
            )}>
              {prompt.category}
            </span>

            {/* Action buttons - proper spacing and size */}
            <div className="flex items-center gap-1.5">
              {/* Edit button */}
              {onEdit && (
                <SimpleTooltip content="Edit prompt" side="top">
                  <motion.button
                    type="button"
                    onClick={handleEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center",
                      "rounded-lg",
                      "bg-white/[0.04] hover:bg-white/[0.08]",
                      "border border-transparent hover:border-white/[0.08]",
                      "text-white/40 hover:text-white/70",
                      "transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                    )}
                    aria-label="Edit prompt"
                  >
                    <Edit3 className="h-4 w-4" strokeWidth={1.75} />
                  </motion.button>
                </SimpleTooltip>
              )}

              {/* Clone button */}
              {onClone && (
                <SimpleTooltip content="Clone prompt" side="top">
                  <motion.button
                    type="button"
                    onClick={handleClone}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center",
                      "rounded-lg",
                      "bg-white/[0.04] hover:bg-white/[0.08]",
                      "border border-transparent hover:border-white/[0.08]",
                      "text-white/40 hover:text-white/70",
                      "transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                    )}
                    aria-label="Clone prompt"
                  >
                    <CopyPlus className="h-4 w-4" strokeWidth={1.75} />
                  </motion.button>
                </SimpleTooltip>
              )}

              {/* Info button */}
              <SimpleTooltip content="View details" side="top">
                <motion.button
                  type="button"
                  onClick={handleViewDetails}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    // Size: 36px for comfortable touch target
                    "flex h-9 w-9 items-center justify-center",
                    "rounded-lg",
                    // Background
                    "bg-white/[0.04] hover:bg-white/[0.08]",
                    "border border-transparent hover:border-white/[0.08]",
                    // Text
                    "text-white/40 hover:text-white/70",
                    // Transition
                    "transition-all duration-150",
                    // Focus
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                  )}
                  aria-label="View prompt details"
                >
                  <Info className="h-4 w-4" strokeWidth={1.75} />
                </motion.button>
              </SimpleTooltip>

              {/* Copy button - primary action, more prominent */}
              <SimpleTooltip content={isCopied ? "Copied!" : "Copy prompt"} side="top">
                <motion.button
                  type="button"
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    // Size: 36px for comfortable touch target
                    "flex h-9 w-9 items-center justify-center",
                    "rounded-lg",
                    // Background - more prominent for primary action
                    isCopied
                      ? "bg-emerald-500/20 border-emerald-500/30"
                      : "bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.06] hover:border-white/[0.12]",
                    "border",
                    // Text
                    isCopied
                      ? "text-emerald-400"
                      : "text-white/50 hover:text-white/80",
                    // Transition
                    "transition-all duration-150",
                    // Focus
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                  )}
                  aria-label={isCopied ? "Copied to clipboard" : "Copy prompt to clipboard"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 45 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Copy className="h-4 w-4" strokeWidth={1.75} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </SimpleTooltip>
            </div>
          </div>

          {/* Subtle success flash overlay */}
          <AnimatePresence>
            {isCopied && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-emerald-500/[0.03] to-transparent"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <PromptDetailModal
        prompt={prompt}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCopy={handleCopy}
        isCopied={isCopied}
      />
    </TooltipProvider>
  );
}
