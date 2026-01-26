"use client";

import { motion } from "framer-motion";
import { Copy, Check, User, Clock, Tag, Lightbulb, FileText, Bot, Wrench, FlaskConical, Bug, GitBranch, MessageCircle } from "lucide-react";
import type { Prompt, PromptCategory } from "@jeffreysprompts/core/prompts/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categoryConfig: Record<PromptCategory, { icon: typeof Lightbulb; color: string; bg: string }> = {
  ideation: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
  documentation: { icon: FileText, color: "text-sky-500", bg: "bg-sky-500/10" },
  automation: { icon: Bot, color: "text-violet-500", bg: "bg-violet-500/10" },
  refactoring: { icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  testing: { icon: FlaskConical, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  debugging: { icon: Bug, color: "text-rose-500", bg: "bg-rose-500/10" },
  workflow: { icon: GitBranch, color: "text-orange-500", bg: "bg-orange-500/10" },
  communication: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
};

interface PromptDetailModalProps {
  prompt: Prompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (e: React.MouseEvent) => void;
  isCopied: boolean;
}

export function PromptDetailModal({ prompt, open, onOpenChange, onCopy, isCopied }: PromptDetailModalProps) {
  const config = categoryConfig[prompt.category];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", config.bg)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </span>
            <div className="flex items-center gap-2">
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", config.bg, config.color)}>
                {prompt.category}
              </span>
              {prompt.difficulty && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                  {prompt.difficulty}
                </span>
              )}
            </div>
          </div>
          <DialogTitle className="text-2xl">{prompt.title}</DialogTitle>
          <DialogDescription className="text-base">{prompt.description}</DialogDescription>
        </DialogHeader>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground py-3 border-y border-border/50">
          {prompt.author && (
            <div className="flex items-center gap-1.5">
              <User className="size-4" />
              <span>{prompt.author}</span>
            </div>
          )}
          {prompt.created && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <span>{prompt.created}</span>
            </div>
          )}
          {prompt.estimatedTokens && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs">~{prompt.estimatedTokens} tokens</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 py-2">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground"
              >
                <Tag className="size-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Prompt content - scrollable */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          <div className="rounded-xl bg-muted/50 border border-border/50 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Prompt Content
            </h4>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-foreground">
              {prompt.content}
            </pre>
          </div>

          {/* When to Use */}
          {prompt.whenToUse && prompt.whenToUse.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                When to Use
              </h4>
              <ul className="space-y-2">
                {prompt.whenToUse.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {prompt.tips && prompt.tips.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Tips
              </h4>
              <ul className="space-y-2">
                {prompt.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="size-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer with copy button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onCopy} className="min-w-[120px]">
            {isCopied ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="size-4" />
                Copied!
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy className="size-4" />
                Copy Prompt
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
