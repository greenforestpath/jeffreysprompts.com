// API route for prompt CRUD operations
// Edit .md files → refresh browser → see changes (no build step)
// POST/PUT/DELETE write to markdown files for git-backed versioning

import { glob } from "glob";
import matter from "gray-matter";
import path from "path";
import { readFile, writeFile, unlink, access } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import type { Prompt } from "@jeffreysprompts/core/prompts/types";
import { safeValidatePrompt } from "@jeffreysprompts/core/prompts/schema";

const execAsync = promisify(exec);

// Path to content directory (relative to app root)
const CONTENT_DIR = path.join(process.cwd(), "../../packages/core/src/prompts/content");

async function loadPrompts(): Promise<Prompt[]> {
  const files = await glob(`${CONTENT_DIR}/*.md`);

  const prompts = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf-8");
      const { data: frontmatter, content } = matter(raw);
      const filename = path.basename(filePath, ".md");

      // Merge frontmatter with computed defaults
      return {
        // From frontmatter (with defaults)
        id: frontmatter.id || filename,
        title: frontmatter.title || filename,
        description: frontmatter.description || "",
        category: frontmatter.category || "workflow",
        tags: frontmatter.tags || [],
        author: frontmatter.author || "Unknown",
        version: frontmatter.version || "1.0.0",
        featured: frontmatter.featured || false,
        difficulty: frontmatter.difficulty,
        twitter: frontmatter.twitter,
        created: frontmatter.created || new Date().toISOString().split("T")[0],
        updatedAt: frontmatter.updatedAt,
        whenToUse: frontmatter.whenToUse,
        tips: frontmatter.tips,
        examples: frontmatter.examples,
        changelog: frontmatter.changelog,
        variables: frontmatter.variables,
        // Content
        content: content.trim(),
        // Computed
        estimatedTokens: frontmatter.estimatedTokens || Math.ceil(content.length / 4),
      } as Prompt;
    })
  );

  // Sort by featured first, then by title
  return prompts.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.title.localeCompare(b.title);
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  try {
    let prompts = await loadPrompts();

    // Filter by ID (single prompt)
    if (id) {
      const prompt = prompts.find((p) => p.id === id);
      if (!prompt) {
        return Response.json({ error: "Prompt not found" }, { status: 404 });
      }
      return Response.json(prompt);
    }

    // Filter by category
    if (category) {
      prompts = prompts.filter((p) => p.category === category);
    }

    // Search by text
    if (q) {
      const query = q.toLowerCase();
      prompts = prompts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.content.toLowerCase().includes(query)
      );
    }

    return Response.json({
      prompts,
      count: prompts.length,
    });
  } catch (error) {
    console.error("Error loading prompts:", error);
    return Response.json(
      { error: "Failed to load prompts", details: String(error) },
      { status: 500 }
    );
  }
}

// Helper: Convert prompt to markdown with frontmatter
function promptToMarkdown(prompt: Partial<Prompt>): string {
  const { content, ...frontmatter } = prompt;
  return matter.stringify(content || "", frontmatter);
}

// Helper: Get file path for prompt ID
function getPromptPath(id: string): string {
  return path.join(CONTENT_DIR, `${id}.md`);
}

// Helper: Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Helper: Bump version (semver patch)
function bumpVersion(version: string): string {
  const parts = version.split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1; // bump patch
  return parts.join(".");
}

// POST: Create new prompt
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate with Zod
    const result = safeValidatePrompt(data);
    if (!result.success) {
      return Response.json(
        { error: "Validation failed", details: result.errors },
        { status: 400 }
      );
    }

    const prompt = result.data;
    const filePath = getPromptPath(prompt.id);

    // Check if already exists
    if (await fileExists(filePath)) {
      return Response.json(
        { error: "Prompt already exists", id: prompt.id },
        { status: 409 }
      );
    }

    // Write markdown file
    const markdown = promptToMarkdown(prompt);
    await writeFile(filePath, markdown, "utf-8");

    return Response.json({
      success: true,
      id: prompt.id,
      message: "Prompt created",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return Response.json(
      { error: "Failed to create prompt", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update existing prompt
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const filePath = getPromptPath(id);

    // Check if exists
    if (!await fileExists(filePath)) {
      return Response.json(
        { error: "Prompt not found", id },
        { status: 404 }
      );
    }

    // Load existing prompt to preserve fields
    const existing = await readFile(filePath, "utf-8");
    const { data: existingData, content: existingContent } = matter(existing);

    // Merge with incoming data
    const incoming = await request.json();
    const merged = {
      ...existingData,
      ...incoming,
      id, // preserve original ID
      updatedAt: new Date().toISOString().split("T")[0],
      version: bumpVersion(existingData.version || "1.0.0"),
      content: incoming.content ?? existingContent.trim(),
    };

    // Validate merged data
    const result = safeValidatePrompt(merged);
    if (!result.success) {
      return Response.json(
        { error: "Validation failed", details: result.errors },
        { status: 400 }
      );
    }

    // Write updated file
    const markdown = promptToMarkdown(result.data);
    await writeFile(filePath, markdown, "utf-8");

    return Response.json({
      success: true,
      id,
      version: result.data.version,
      message: "Prompt updated",
    });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return Response.json(
      { error: "Failed to update prompt", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Remove prompt
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const filePath = getPromptPath(id);

    // Check if exists
    if (!await fileExists(filePath)) {
      return Response.json(
        { error: "Prompt not found", id },
        { status: 404 }
      );
    }

    // Delete file
    await unlink(filePath);

    return Response.json({
      success: true,
      id,
      message: "Prompt deleted",
    });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return Response.json(
      { error: "Failed to delete prompt", details: String(error) },
      { status: 500 }
    );
  }
}
