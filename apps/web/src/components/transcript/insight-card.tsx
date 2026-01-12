"use client";

import { motion } from "framer-motion";
import { Brain, Lightbulb, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type TranscriptHighlight } from "@/lib/transcript/types";

interface InsightCardProps {
  highlight: TranscriptHighlight;
  index?: number;
  onClick?: () => void;
}

const typeConfig = {
  key_decision: {
    icon: Brain,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    label: "Key Decision",
  },
  interesting_prompt: {
    icon: Lightbulb,
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    label: "Interesting Prompt",
  },
  clever_solution: {
    icon: CheckCircle,
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    label: "Clever Solution",
  },
  lesson_learned: {
    icon: AlertTriangle,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    label: "Lesson Learned",
  },
};

export function InsightCard({ highlight, index = 0, onClick }: InsightCardProps) {
  const config = typeConfig[highlight.type];
  const Icon = config.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border",
        "bg-white dark:bg-neutral-900",
        config.borderColor,
        "hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-neutral-900/50",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            config.color
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {config.label}
        </span>
      </div>

      {/* Annotation text */}
      <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
        {highlight.annotation}
      </p>

      {/* Message ID hint */}
      <div className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
        Click to view in context
      </div>
    </motion.button>
  );
}
