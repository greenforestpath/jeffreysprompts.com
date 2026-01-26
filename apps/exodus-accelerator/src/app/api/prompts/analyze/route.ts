// AI-powered prompt metadata generator
// Uses local claude CLI (claude -p) for analysis - no API keys needed

import { exec } from "child_process";
import { promisify } from "util";
import type { PromptCategory } from "@jeffreysprompts/core/prompts/types";

const execAsync = promisify(exec);

const VALID_CATEGORIES: PromptCategory[] = [
  "ideation", "documentation", "automation", "refactoring",
  "testing", "debugging", "workflow", "communication"
];

interface GeneratedMetadata {
  title: string;
  description: string;
  category: PromptCategory;
  tags: string[];
  whenToUse: string[];
  tips: string[];
}

const ANALYSIS_PROMPT = `Analyze this prompt and generate metadata. Respond ONLY with valid JSON (no markdown, no explanation):

{
  "title": "concise 3-6 word title",
  "description": "one sentence description",
  "category": "one of: ideation, documentation, automation, refactoring, testing, debugging, workflow, communication",
  "tags": ["3-5", "lowercase", "tags"],
  "whenToUse": ["when to use bullet 1", "when to use bullet 2"],
  "tips": ["practical tip 1", "practical tip 2"]
}

PROMPT TO ANALYZE:
`;

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return Response.json(
        { error: "Missing or invalid 'content' field" },
        { status: 400 }
      );
    }

    // Try claude CLI first
    try {
      const metadata = await analyzeWithClaude(content);
      return Response.json(metadata);
    } catch (claudeError) {
      console.warn("Claude CLI failed, using fallback:", claudeError);
      // Fallback to heuristics
      return Response.json(generateFallbackMetadata(content));
    }
  } catch (error) {
    console.error("Error analyzing prompt:", error);
    return Response.json(
      { error: "Failed to analyze prompt", details: String(error) },
      { status: 500 }
    );
  }
}

async function analyzeWithClaude(content: string): Promise<GeneratedMetadata> {
  const fullPrompt = ANALYSIS_PROMPT + content;

  // Escape for shell - use base64 to avoid escaping issues
  const base64Prompt = Buffer.from(fullPrompt).toString("base64");

  // Use claude -p with --output-format json for clean output
  const { stdout } = await execAsync(
    `echo "${base64Prompt}" | base64 -d | claude -p --output-format json`,
    {
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
    }
  );

  // Parse the response - claude -p with --output-format json returns structured output
  let parsed: any;
  try {
    // The output should be JSON with a "result" field
    const response = JSON.parse(stdout);
    const text = response.result || response.content || stdout;

    // Extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // Try parsing stdout directly
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse Claude response");
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  return validateMetadata(parsed, content);
}

function validateMetadata(metadata: any, content: string): GeneratedMetadata {
  // Ensure category is valid
  let category: PromptCategory = "workflow";
  if (metadata.category && VALID_CATEGORIES.includes(metadata.category)) {
    category = metadata.category;
  }

  // Ensure arrays are arrays
  const ensureArray = (val: any): string[] => {
    if (Array.isArray(val)) return val.filter((v) => typeof v === "string");
    if (typeof val === "string") return [val];
    return [];
  };

  return {
    title: String(metadata.title || "Untitled Prompt").slice(0, 100),
    description: String(metadata.description || "").slice(0, 200),
    category,
    tags: ensureArray(metadata.tags).slice(0, 10),
    whenToUse: ensureArray(metadata.whenToUse).slice(0, 5),
    tips: ensureArray(metadata.tips).slice(0, 5),
  };
}

function generateFallbackMetadata(content: string): GeneratedMetadata {
  // Simple heuristic-based fallback when claude CLI unavailable
  const firstLine = content.split("\n")[0].slice(0, 100);
  const words = content.toLowerCase().split(/\s+/);

  // Detect category from keywords
  let category: PromptCategory = "workflow";
  if (words.some((w) => ["test", "testing", "spec", "unit"].includes(w))) {
    category = "testing";
  } else if (words.some((w) => ["bug", "debug", "fix", "error"].includes(w))) {
    category = "debugging";
  } else if (words.some((w) => ["doc", "document", "readme", "comment"].includes(w))) {
    category = "documentation";
  } else if (words.some((w) => ["refactor", "clean", "improve", "optimize"].includes(w))) {
    category = "refactoring";
  } else if (words.some((w) => ["idea", "brainstorm", "create", "generate"].includes(w))) {
    category = "ideation";
  } else if (words.some((w) => ["automate", "script", "bot", "agent"].includes(w))) {
    category = "automation";
  }

  return {
    title: firstLine.slice(0, 50) || "New Prompt",
    description: `A ${category} prompt`,
    category,
    tags: [category],
    whenToUse: ["When you need assistance with this type of task"],
    tips: ["Review and customize before using"],
  };
}
