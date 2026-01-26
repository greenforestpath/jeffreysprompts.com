// API route that reads prompts from markdown files
// Edit .md files → refresh browser → see changes (no build step)

import { glob } from "glob";
import matter from "gray-matter";
import path from "path";
import { readFile } from "fs/promises";
import type { Prompt } from "@jeffreysprompts/core/prompts/types";

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
