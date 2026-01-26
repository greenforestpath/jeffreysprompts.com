// packages/core/src/prompts/schema.ts
// Zod schema validation for prompts

import { z } from "zod";

export const PromptCategorySchema = z.enum([
  "ideation",
  "documentation",
  "automation",
  "refactoring",
  "testing",
  "debugging",
  "workflow",
  "communication",
]);

export const PromptDifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);

export const PromptVariableTypeSchema = z.enum(["text", "multiline", "select", "file", "path"]);

export const PromptVariableSchema = z.object({
  name: z.string().regex(/^[A-Z0-9_]+$/, "Variable names must be UPPER_SNAKE_CASE"),
  label: z.string().min(1),
  description: z.string().optional(),
  type: PromptVariableTypeSchema,
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  default: z.string().optional(),
});

export const PromptChangeSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semantic (x.y.z)"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be ISO 8601 (YYYY-MM-DD)"),
  type: z.enum(["improvement", "fix", "breaking"]),
  summary: z.string().min(1),
});

export const PromptSchema = z.object({
  id: z
    .string()
    .min(3, "ID must be at least 3 characters")
    .max(50, "ID must be at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "ID must be lowercase kebab-case"),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be at most 200 characters"),
  category: PromptCategorySchema,
  tags: z
    .array(z.string().min(2).max(30))
    .min(1, "At least one tag is required")
    .max(10, "At most 10 tags allowed"),
  author: z.string().min(1, "Author is required"),
  twitter: z.string().regex(/^@[a-zA-Z0-9_]+$/, "Twitter handle must start with @").optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver (e.g., 1.0.0)"),
  featured: z.boolean().optional(),
  difficulty: PromptDifficultySchema.optional(),
  estimatedTokens: z.number().int().positive().max(50000).optional(),
  created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .max(15000, "Content must be at most 15000 characters"),
  variables: z.array(PromptVariableSchema).optional(),
  whenToUse: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
  changelog: z.array(PromptChangeSchema).optional(),
});

// Type exports
export type ValidatedPrompt = z.infer<typeof PromptSchema>;

// Throws on invalid - use for build-time validation
export function validatePrompt(prompt: unknown): ValidatedPrompt {
  return PromptSchema.parse(prompt);
}

export function validatePrompts(prompts: unknown[]): ValidatedPrompt[] {
  return prompts.map(validatePrompt);
}

// Returns result object - use for API/UI validation
export function safeValidatePrompt(data: unknown): {
  success: true;
  data: ValidatedPrompt;
} | {
  success: false;
  errors: string[];
} {
  const result = PromptSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });

  return { success: false, errors };
}
