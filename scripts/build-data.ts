#!/usr/bin/env bun
/**
 * Build data assets for JeffreysPrompts.com
 *
 * This script:
 * 1. Validates all prompts against the Zod schema
 * 2. Generates registry.json with full payload
 * 3. Generates registry.manifest.json with checksums
 * 4. Writes files to apps/web/public/
 */

import { createHash } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Import from core package
import { prompts, categories, tags } from "@jeffreysprompts/core/prompts/registry";
import { bundles } from "@jeffreysprompts/core/prompts/bundles";
import { workflows } from "@jeffreysprompts/core/prompts/workflows";
import { validatePrompts } from "@jeffreysprompts/core/prompts/schema";

const OUTPUT_DIR = join(import.meta.dir, "..", "apps", "web", "public");

// Compute SHA256 hash of a string
function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

// Format bytes to human-readable size
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  const startTime = Date.now();
  console.log("🔨 Building data assets...\n");

  // Step 1: Validate prompts
  console.log("📋 Validating prompts...");
  const errors: string[] = [];

  try {
    validatePrompts(prompts);
    console.log(`   ✓ ${prompts.length} prompts validated successfully\n`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`   ✗ Validation failed: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }

  // Check for duplicate IDs
  const ids = prompts.map((p) => p.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    console.error(`   ✗ Duplicate prompt IDs found: ${duplicates.join(", ")}`);
    process.exit(1);
  }

  // Step 2: Build registry payload
  console.log("📦 Building registry payload...");
  const version = process.env.JFP_REGISTRY_VERSION ?? "1.0.0";

  const registry = {
    schemaVersion: 1,
    version,
    generatedAt: new Date().toISOString(),
    prompts,
    bundles,
    workflows,
    meta: {
      promptCount: prompts.length,
      bundleCount: bundles.length,
      workflowCount: workflows.length,
      categories: categories as string[],
      tags,
    },
  };

  const registryJson = JSON.stringify(registry, null, 2);
  const registryMinified = JSON.stringify(registry);
  console.log(`   ✓ Payload built (${formatBytes(registryJson.length)})\n`);

  // Step 3: Compute checksums
  console.log("🔐 Computing checksums...");
  const registryHash = sha256(registryMinified);

  const manifest = {
    schemaVersion: 1,
    version,
    generatedAt: new Date().toISOString(),
    checksums: {
      registry: `sha256:${registryHash}`,
      prompts: Object.fromEntries(
        prompts.map((p) => [p.id, `sha256:${sha256(p.content)}`])
      ),
    },
    counts: {
      prompts: prompts.length,
      bundles: bundles.length,
      workflows: workflows.length,
    },
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  console.log(`   ✓ Checksums computed (${prompts.length} prompts)\n`);

  // Step 4: Write files
  console.log("💾 Writing output files...");

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const registryPath = join(OUTPUT_DIR, "registry.json");
  const manifestPath = join(OUTPUT_DIR, "registry.manifest.json");

  writeFileSync(registryPath, registryJson);
  writeFileSync(manifestPath, manifestJson);

  console.log(`   ✓ ${registryPath}`);
  console.log(`   ✓ ${manifestPath}\n`);

  // Summary
  const elapsed = Date.now() - startTime;
  console.log("✅ Build complete!\n");
  console.log("📊 Summary:");
  console.log(`   Prompts:    ${prompts.length}`);
  console.log(`   Bundles:    ${bundles.length}`);
  console.log(`   Workflows:  ${workflows.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Tags:       ${tags.length}`);
  console.log(`   Duration:   ${elapsed}ms`);
  console.log(`   Output:     ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
