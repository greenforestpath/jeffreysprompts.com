// API route for prompt version history
// Uses git log in development, falls back to versions.json in production

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { readFile, access } from "fs/promises";

const execAsync = promisify(exec);

// Path to content directory
const CONTENT_DIR = path.join(process.cwd(), "../../packages/core/src/prompts/content");

interface PromptVersion {
  version: string;
  date: string;
  hash: string;
  message?: string;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getVersionsFromGit(promptId: string): Promise<PromptVersion[]> {
  const filePath = path.join(CONTENT_DIR, `${promptId}.md`);

  // Check if file exists
  if (!await fileExists(filePath)) {
    return [];
  }

  try {
    // Get git log for this specific file
    const { stdout } = await execAsync(
      `git log --follow --pretty=format:"%H|%ad|%s" --date=short -- "${filePath}"`,
      { cwd: CONTENT_DIR }
    );

    if (!stdout.trim()) {
      return [];
    }

    const lines = stdout.trim().split("\n");
    const versions: PromptVersion[] = [];

    // Parse version from frontmatter at each commit
    for (let i = 0; i < lines.length; i++) {
      const [hash, date, ...messageParts] = lines[i].split("|");
      const message = messageParts.join("|");

      // For now, we'll estimate versions based on commit order
      // In a real implementation, we'd check out each commit and read the version field
      const versionNumber = `1.0.${lines.length - 1 - i}`;

      versions.push({
        version: versionNumber,
        date,
        hash,
        message: message || undefined,
      });
    }

    return versions;
  } catch (error) {
    // Git might not be available (e.g., Vercel production)
    console.warn("Git not available for version history:", error);
    return [];
  }
}

async function getVersionsFromArtifact(promptId: string): Promise<PromptVersion[]> {
  // In production, try to read from pre-built versions artifact
  try {
    const versionsPath = path.join(CONTENT_DIR, ".versions", `${promptId}.json`);
    if (await fileExists(versionsPath)) {
      const content = await readFile(versionsPath, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // No artifact available
  }
  return [];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "Missing prompt ID" },
        { status: 400 }
      );
    }

    // Try git first (works in development)
    let versions = await getVersionsFromGit(id);

    // Fallback to artifact (for production)
    if (versions.length === 0) {
      versions = await getVersionsFromArtifact(id);
    }

    // If still no versions, return the current version only
    if (versions.length === 0) {
      const filePath = path.join(CONTENT_DIR, `${id}.md`);
      if (await fileExists(filePath)) {
        // Read current version from frontmatter
        const content = await readFile(filePath, "utf-8");
        const versionMatch = content.match(/^version:\s*["']?([^"'\n]+)/m);
        const version = versionMatch ? versionMatch[1] : "1.0.0";

        versions = [{
          version,
          date: new Date().toISOString().split("T")[0],
          hash: "current",
        }];
      }
    }

    return Response.json({
      promptId: id,
      versions,
      count: versions.length,
    });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return Response.json(
      { error: "Failed to fetch versions", details: String(error) },
      { status: 500 }
    );
  }
}
