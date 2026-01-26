// API route for prompt suggestions queue
// Manages pending AI-generated prompt suggestions for human review

import { readFile, writeFile, rename, unlink } from "fs/promises";
import path from "path";

const SUGGESTIONS_DIR = path.join(process.cwd(), "../../packages/core/src/prompts/suggestions");
const CONTENT_DIR = path.join(process.cwd(), "../../packages/core/src/prompts/content");
const INDEX_PATH = path.join(SUGGESTIONS_DIR, "index.json");

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
}

interface SuggestionsIndex {
  suggestions: Suggestion[];
}

async function readIndex(): Promise<SuggestionsIndex> {
  try {
    const content = await readFile(INDEX_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return { suggestions: [] };
  }
}

async function writeIndex(index: SuggestionsIndex): Promise<void> {
  await writeFile(INDEX_PATH, JSON.stringify(index, null, 2));
}

async function readSuggestionContent(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(SUGGESTIONS_DIR, `${slug}.md`);
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

// GET - List all suggestions with content
export async function GET() {
  try {
    const index = await readIndex();

    // Enrich with file content
    const suggestionsWithContent = await Promise.all(
      index.suggestions.map(async (s) => {
        const content = await readSuggestionContent(s.slug);
        return { ...s, fileContent: content };
      })
    );

    return Response.json({
      suggestions: suggestionsWithContent,
      count: suggestionsWithContent.length,
      pending: suggestionsWithContent.filter(s => s.status === "pending").length,
    });
  } catch (error) {
    console.error("Error reading suggestions:", error);
    return Response.json(
      { error: "Failed to read suggestions", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update suggestion (approve/reject/edit)
export async function PUT(request: Request) {
  try {
    const { id, action, updatedContent } = await request.json();

    if (!id || !action) {
      return Response.json(
        { error: "Missing id or action" },
        { status: 400 }
      );
    }

    const index = await readIndex();
    const suggestionIndex = index.suggestions.findIndex(s => s.id === id);

    if (suggestionIndex === -1) {
      return Response.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    const suggestion = index.suggestions[suggestionIndex];

    if (action === "approve") {
      // Move file from suggestions/ to content/
      const srcPath = path.join(SUGGESTIONS_DIR, `${suggestion.slug}.md`);
      const destPath = path.join(CONTENT_DIR, `${suggestion.slug}.md`);

      // If content was edited, write the updated content
      if (updatedContent) {
        await writeFile(destPath, updatedContent);
        await unlink(srcPath);
      } else {
        await rename(srcPath, destPath);
      }

      // Update index
      index.suggestions[suggestionIndex] = {
        ...suggestion,
        status: "approved",
        reviewedAt: new Date().toISOString(),
      };
      await writeIndex(index);

      return Response.json({
        success: true,
        message: `Approved: ${suggestion.slug}`,
        action: "rebuild_required",
      });

    } else if (action === "reject") {
      // Mark as rejected (keep file for reference)
      index.suggestions[suggestionIndex] = {
        ...suggestion,
        status: "rejected",
        reviewedAt: new Date().toISOString(),
      };
      await writeIndex(index);

      return Response.json({
        success: true,
        message: `Rejected: ${suggestion.slug}`,
      });

    } else if (action === "edit") {
      // Update the suggestion content
      if (!updatedContent) {
        return Response.json(
          { error: "Missing updatedContent for edit action" },
          { status: 400 }
        );
      }

      const filePath = path.join(SUGGESTIONS_DIR, `${suggestion.slug}.md`);
      await writeFile(filePath, updatedContent);

      return Response.json({
        success: true,
        message: `Updated: ${suggestion.slug}`,
      });

    } else {
      return Response.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return Response.json(
      { error: "Failed to update suggestion", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Remove a suggestion entirely
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Missing suggestion id" },
        { status: 400 }
      );
    }

    const index = await readIndex();
    const suggestionIndex = index.suggestions.findIndex(s => s.id === id);

    if (suggestionIndex === -1) {
      return Response.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    const suggestion = index.suggestions[suggestionIndex];

    // Delete the file
    try {
      const filePath = path.join(SUGGESTIONS_DIR, `${suggestion.slug}.md`);
      await unlink(filePath);
    } catch {
      // File might already be gone
    }

    // Remove from index
    index.suggestions.splice(suggestionIndex, 1);
    await writeIndex(index);

    return Response.json({
      success: true,
      message: `Deleted: ${suggestion.slug}`,
    });
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    return Response.json(
      { error: "Failed to delete suggestion", details: String(error) },
      { status: 500 }
    );
  }
}
