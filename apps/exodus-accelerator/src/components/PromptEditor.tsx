"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, Eye, Edit3, Sparkles, Loader2, ChevronDown, ChevronRight, Trash2, AlertCircle, History } from "lucide-react";
import type { Prompt, PromptCategory, PromptDifficulty } from "@jeffreysprompts/core/prompts/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES: PromptCategory[] = [
  "ideation", "documentation", "automation", "refactoring",
  "testing", "debugging", "workflow", "communication"
];

const DIFFICULTIES: PromptDifficulty[] = ["beginner", "intermediate", "advanced"];

interface PromptVersion {
  version: string;
  date: string;
  hash?: string;
}

interface PromptEditorProps {
  prompt?: Prompt; // undefined = create mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prompt: Prompt) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

type FormData = {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  tags: string;
  difficulty: PromptDifficulty;
  content: string;
  whenToUse: string;
  tips: string;
};

interface GeneratedMetadata {
  title: string;
  description: string;
  category: PromptCategory;
  tags: string[];
  whenToUse: string[];
  tips: string[];
}

function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export function PromptEditor({ prompt, open, onOpenChange, onSave, onDelete }: PromptEditorProps) {
  // Clone mode: prompt exists but id is empty
  const isEdit = !!prompt && !!prompt.id;
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMetadata, setShowMetadata] = useState(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const [form, setForm] = useState<FormData>({
    id: "",
    title: "",
    description: "",
    category: "workflow",
    tags: "",
    difficulty: "intermediate",
    content: "",
    whenToUse: "",
    tips: "",
  });

  // Load prompt data when editing
  useEffect(() => {
    if (prompt) {
      setForm({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        category: prompt.category,
        tags: prompt.tags.join(", "),
        difficulty: prompt.difficulty || "intermediate",
        content: prompt.content,
        whenToUse: prompt.whenToUse?.join("\n") || "",
        tips: prompt.tips?.join("\n") || "",
      });
      setShowMetadata(true); // Show metadata when editing
      // Load version history
      loadVersions(prompt.id);
    } else {
      // Reset form for create mode
      setForm({
        id: "",
        title: "",
        description: "",
        category: "workflow",
        tags: "",
        difficulty: "intermediate",
        content: "",
        whenToUse: "",
        tips: "",
      });
      setShowMetadata(false);
      setVersions([]);
    }
    setErrors([]);
    setMode("edit");
  }, [prompt, open]);

  // Auto-generate ID from title
  useEffect(() => {
    if (!isEdit && form.title) {
      setForm(f => ({ ...f, id: generateId(f.title) }));
    }
  }, [form.title, isEdit]);

  const loadVersions = async (id: string) => {
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/prompts/${id}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch {
      // Versions API may not exist yet
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors([]);
  };

  const handleGenerateMetadata = async () => {
    if (!form.content.trim()) {
      setErrors(["Please enter prompt content first"]);
      return;
    }

    setGenerating(true);
    setErrors([]);

    try {
      const res = await fetch("/api/prompts/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze prompt");
      }

      const metadata: GeneratedMetadata = await res.json();

      setForm(f => ({
        ...f,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags.join(", "),
        whenToUse: metadata.whenToUse.join("\n"),
        tips: metadata.tips.join("\n"),
        id: generateId(metadata.title),
      }));

      setShowMetadata(true);
    } catch (err: any) {
      setErrors([err.message || "Failed to generate metadata"]);
    } finally {
      setGenerating(false);
    }
  };

  const buildPrompt = (): Partial<Prompt> => ({
    id: form.id,
    title: form.title,
    description: form.description,
    category: form.category,
    tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    author: "Jeffrey Emanuel",
    twitter: "@doodlestein",
    version: prompt?.version || "1.0.0",
    featured: false,
    difficulty: form.difficulty,
    created: prompt?.created || new Date().toISOString().split("T")[0],
    content: form.content,
    whenToUse: form.whenToUse.split("\n").map(s => s.trim()).filter(Boolean),
    tips: form.tips.split("\n").map(s => s.trim()).filter(Boolean),
    estimatedTokens: Math.ceil(form.content.length / 4),
  });

  const handleSave = async () => {
    // Validate minimum fields
    if (!form.content.trim()) {
      setErrors(["Prompt content is required"]);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      // Auto-generate metadata if title is missing (new prompts)
      let currentForm = form;
      if (!form.title.trim() && !isEdit) {
        try {
          const res = await fetch("/api/prompts/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: form.content }),
          });

          if (res.ok) {
            const metadata: GeneratedMetadata = await res.json();
            currentForm = {
              ...form,
              title: metadata.title,
              description: metadata.description,
              category: metadata.category,
              tags: metadata.tags.join(", "),
              whenToUse: metadata.whenToUse.join("\n"),
              tips: metadata.tips.join("\n"),
              id: generateId(metadata.title),
            };
            setForm(currentForm);
          }
        } catch {
          // If AI fails, use fallback title from first line
          const firstLine = form.content.split("\n")[0].slice(0, 50) || "New Prompt";
          currentForm = {
            ...form,
            title: firstLine,
            id: generateId(firstLine),
          };
          setForm(currentForm);
        }
      }

      const promptData = {
        id: currentForm.id,
        title: currentForm.title,
        description: currentForm.description,
        category: currentForm.category,
        tags: currentForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        author: "Jeffrey Emanuel",
        twitter: "@doodlestein",
        version: prompt?.version || "1.0.0",
        featured: false,
        difficulty: currentForm.difficulty,
        created: prompt?.created || new Date().toISOString().split("T")[0],
        content: currentForm.content,
        whenToUse: currentForm.whenToUse.split("\n").map(s => s.trim()).filter(Boolean),
        tips: currentForm.tips.split("\n").map(s => s.trim()).filter(Boolean),
        estimatedTokens: Math.ceil(currentForm.content.length / 4),
      } as Prompt;

      await onSave(promptData);
      onOpenChange(false);
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors([err.message || "Failed to save prompt"]);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt || !onDelete) return;
    if (!confirm(`Delete "${prompt.title}"? This cannot be undone.`)) return;

    setSaving(true);
    try {
      await onDelete(prompt.id);
      onOpenChange(false);
    } catch (err: any) {
      setErrors([err.message || "Failed to delete prompt"]);
    } finally {
      setSaving(false);
    }
  };

  const previewPrompt = buildPrompt();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white">
              {isEdit ? `Edit: ${prompt.title}` : "Create New Prompt"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
                className="border-white/20 text-white/70 hover:text-white"
              >
                {mode === "edit" ? (
                  <><Eye className="size-4 mr-1" /> Preview</>
                ) : (
                  <><Edit3 className="size-4 mr-1" /> Edit</>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Error display */}
        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle className="size-5 mt-0.5 shrink-0" />
              <div className="text-sm">
                {errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto flex">
          {/* Main editor panel */}
          <div className={cn(
            "flex-1 px-6 py-4",
            isEdit && versions.length > 0 && "border-r border-white/10"
          )}>
            {mode === "edit" ? (
              <div className="space-y-6">
                {/* Prompt Content - ALWAYS FIRST AND PROMINENT */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-white/90">
                    Prompt Content *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border bg-white/5 text-sm font-mono text-white/90",
                      "border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30",
                      "placeholder:text-white/30 min-h-[200px] resize-y"
                    )}
                    placeholder="Paste your prompt here..."
                    autoFocus={!isEdit}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-white/40">
                      ~{Math.ceil(form.content.length / 4)} tokens
                    </span>
                    {!isEdit && (
                      <Button
                        onClick={handleGenerateMetadata}
                        disabled={generating || !form.content.trim()}
                        className="bg-violet-600 hover:bg-violet-500 text-white"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-4 mr-2" />
                            Generate Metadata
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Collapsible Metadata Section */}
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowMetadata(!showMetadata)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/[0.07] transition-colors"
                  >
                    <span className="text-sm font-medium text-white/80">
                      Metadata {form.title && `— ${form.title}`}
                    </span>
                    {showMetadata ? (
                      <ChevronDown className="size-4 text-white/40" />
                    ) : (
                      <ChevronRight className="size-4 text-white/40" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showMetadata && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4 bg-white/[0.02]">
                          {/* Title and ID */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium mb-1 block text-white/60">Title</label>
                              <input
                                type="text"
                                value={form.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90"
                                placeholder="Auto-generated or enter manually"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-white/60">ID</label>
                              <input
                                type="text"
                                value={form.id}
                                onChange={(e) => handleChange("id", e.target.value)}
                                disabled={isEdit}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-mono text-white/70 disabled:opacity-50"
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="text-xs font-medium mb-1 block text-white/60">Description</label>
                            <input
                              type="text"
                              value={form.description}
                              onChange={(e) => handleChange("description", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90"
                            />
                          </div>

                          {/* Category and Difficulty */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium mb-1 block text-white/60">Category</label>
                              <select
                                value={form.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90"
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block text-white/60">Difficulty</label>
                              <select
                                value={form.difficulty}
                                onChange={(e) => handleChange("difficulty", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90"
                              >
                                {DIFFICULTIES.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Tags */}
                          <div>
                            <label className="text-xs font-medium mb-1 block text-white/60">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={form.tags}
                              onChange={(e) => handleChange("tags", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90"
                            />
                          </div>

                          {/* When to Use */}
                          <div>
                            <label className="text-xs font-medium mb-1 block text-white/60">When to Use (one per line)</label>
                            <textarea
                              value={form.whenToUse}
                              onChange={(e) => handleChange("whenToUse", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90 min-h-[60px]"
                            />
                          </div>

                          {/* Tips */}
                          <div>
                            <label className="text-xs font-medium mb-1 block text-white/60">Tips (one per line)</label>
                            <textarea
                              value={form.tips}
                              onChange={(e) => handleChange("tips", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/90 min-h-[60px]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-violet-500/20 text-violet-400">
                    {previewPrompt.category}
                  </span>
                  {previewPrompt.difficulty && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/60 capitalize">
                      {previewPrompt.difficulty}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white">{previewPrompt.title || "Untitled"}</h2>
                <p className="text-white/60">{previewPrompt.description || "No description"}</p>

                <div className="flex flex-wrap gap-2">
                  {previewPrompt.tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md text-xs bg-white/10 text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                    Prompt Content
                  </h4>
                  <pre className="whitespace-pre-wrap text-sm font-mono text-white/80">
                    {previewPrompt.content || "No content"}
                  </pre>
                </div>

                {previewPrompt.whenToUse && previewPrompt.whenToUse.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                      When to Use
                    </h4>
                    <ul className="space-y-1 text-sm text-white/60">
                      {previewPrompt.whenToUse.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewPrompt.tips && previewPrompt.tips.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                      Tips
                    </h4>
                    <ul className="space-y-1 text-sm text-white/60">
                      {previewPrompt.tips.map((tip, i) => (
                        <li key={i}>💡 {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Version History Sidebar (only when editing) */}
          {isEdit && (
            <div className="w-64 px-4 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <History className="size-4 text-white/40" />
                <h3 className="text-sm font-medium text-white/60">Version History</h3>
              </div>

              {loadingVersions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-4 animate-spin text-white/30" />
                </div>
              ) : versions.length > 0 ? (
                <div className="space-y-2">
                  {versions.map((v, i) => (
                    <button
                      key={v.hash || i}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm",
                        "bg-white/5 hover:bg-white/10 transition-colors",
                        i === 0 && "border border-violet-500/30"
                      )}
                    >
                      <div className="font-medium text-white/80">v{v.version}</div>
                      <div className="text-xs text-white/40">{v.date}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/30 text-center py-8">
                  No version history yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <div>
            {isEdit && onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={saving}
                className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
              >
                <Trash2 className="size-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="border-white/20 text-white/70"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.content.trim()}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  {!form.title.trim() && !isEdit ? "Generating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="size-4 mr-1" />
                  {isEdit ? "Save Changes" : "Save"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
