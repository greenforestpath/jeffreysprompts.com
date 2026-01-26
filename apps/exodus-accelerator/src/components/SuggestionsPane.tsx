"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Suggestion {
  id: string;
  slug: string;
  type: "new" | "edit";
  targetId?: string;
  status: "pending" | "approved" | "rejected";
  confidence: number;
  rationale: string;
  createdAt: string;
  reviewedAt?: string;
  fileContent: string | null;
}

interface SuggestionsPaneProps {
  onEditSuggestion?: (slug: string, content: string) => void;
  onRefreshPrompts?: () => void;
}

export function SuggestionsPane({ onEditSuggestion, onRefreshPrompts }: SuggestionsPaneProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { success, error } = useToast();

  const loadSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/prompts/suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/prompts/suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      success(
        action === "approve" ? "Approved" : "Rejected",
        data.message
      );

      // Refresh suggestions
      await loadSuggestions();

      // If approved, prompt to rebuild
      if (action === "approve" && data.action === "rebuild_required") {
        onRefreshPrompts?.();
      }
    } catch (err: any) {
      error("Action failed", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this suggestion permanently?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/prompts/suggestions?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      success("Deleted", data.message);
      await loadSuggestions();
    } catch (err: any) {
      error("Delete failed", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (suggestion: Suggestion) => {
    if (suggestion.fileContent && onEditSuggestion) {
      onEditSuggestion(suggestion.slug, suggestion.fileContent);
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const reviewedSuggestions = suggestions.filter(s => s.status !== "pending");

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-emerald-400";
    if (confidence >= 80) return "text-amber-400";
    return "text-orange-400";
  };

  const extractTitle = (content: string | null): string => {
    if (!content) return "Unknown";
    const match = content.match(/^title:\s*["']?([^"'\n]+)/m);
    return match ? match[1] : "Unknown";
  };

  const extractDescription = (content: string | null): string => {
    if (!content) return "";
    const match = content.match(/^description:\s*["']?([^"'\n]+)/m);
    return match ? match[1] : "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Lightbulb className="h-8 w-8 text-white/20 mb-3" />
        <div className="text-white/40 text-sm">No suggestions in queue</div>
        <div className="text-white/20 text-xs mt-1">
          Run the Prompt Registry Improver to generate ideas
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending suggestions */}
      {pendingSuggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Pending Review ({pendingSuggestions.length})
          </h3>
          <div className="space-y-3">
            {pendingSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                expanded={expandedId === suggestion.id}
                onToggle={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
                onApprove={() => handleAction(suggestion.id, "approve")}
                onReject={() => handleAction(suggestion.id, "reject")}
                onEdit={() => handleEdit(suggestion)}
                onDelete={() => handleDelete(suggestion.id)}
                loading={actionLoading === suggestion.id}
                getConfidenceColor={getConfidenceColor}
                extractTitle={extractTitle}
                extractDescription={extractDescription}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviewed suggestions */}
      {reviewedSuggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 mb-3">
            Previously Reviewed ({reviewedSuggestions.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {reviewedSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={cn(
                  "px-4 py-3 rounded-lg border",
                  suggestion.status === "approved"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-red-500/5 border-red-500/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {suggestion.status === "approved" ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-white/70">
                      {extractTitle(suggestion.fileContent)}
                    </span>
                  </div>
                  <span className="text-xs text-white/30">
                    {suggestion.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  expanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onDelete: () => void;
  loading: boolean;
  getConfidenceColor: (c: number) => string;
  extractTitle: (c: string | null) => string;
  extractDescription: (c: string | null) => string;
}

function SuggestionCard({
  suggestion,
  expanded,
  onToggle,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  loading,
  getConfidenceColor,
  extractTitle,
  extractDescription,
}: SuggestionCardProps) {
  const title = extractTitle(suggestion.fileContent);
  const description = extractDescription(suggestion.fileContent);

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border overflow-hidden",
        "bg-white/[0.03] border-white/[0.08]",
        "hover:border-white/[0.12] transition-colors"
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start gap-3 text-left"
      >
        <div className="mt-0.5">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white/90">{title}</span>
            <span className={cn(
              "text-xs font-mono",
              getConfidenceColor(suggestion.confidence)
            )}>
              {suggestion.confidence}%
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 uppercase">
              {suggestion.type}
            </span>
          </div>
          <p className="text-xs text-white/40 line-clamp-1">{description}</p>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Rationale */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="text-xs font-medium text-white/50 mb-1">Rationale</div>
                <p className="text-sm text-white/70">{suggestion.rationale}</p>
              </div>

              {/* Preview of content */}
              {suggestion.fileContent && (
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] max-h-48 overflow-y-auto">
                  <div className="text-xs font-medium text-white/50 mb-1">Content Preview</div>
                  <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap">
                    {suggestion.fileContent.slice(0, 800)}
                    {suggestion.fileContent.length > 800 && "..."}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={onApprove}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  onClick={onEdit}
                  disabled={loading}
                  variant="outline"
                  className="border-white/20 text-white/70"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={onReject}
                  disabled={loading}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={onDelete}
                  disabled={loading}
                  variant="ghost"
                  className="text-white/30 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
