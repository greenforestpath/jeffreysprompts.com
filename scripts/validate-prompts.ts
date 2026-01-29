#!/usr/bin/env bun
// scripts/validate-prompts.ts
// CI validation script for prompt definitions

import { prompts } from "@jeffreysprompts/core/prompts";
import { bundles } from "@jeffreysprompts/core/prompts/bundles";
import { workflows } from "@jeffreysprompts/core/prompts/workflows";
import { PromptSchema } from "@jeffreysprompts/core/prompts/schema";

interface ValidationError {
  id: string;
  type: "schema" | "duplicate" | "format" | "content" | "bundle" | "workflow";
  message: string;
}

function validate(): ValidationError[] {
  const errors: ValidationError[] = [];
  const ids = new Set<string>();

  console.log("Validating prompts...\n");

  for (const prompt of prompts) {
    // Schema validation
    const result = PromptSchema.safeParse(prompt);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          id: prompt.id,
          type: "schema",
          message: `${issue.path.join(".")}: ${issue.message}`,
        });
      }
    }

    // Duplicate ID check
    if (ids.has(prompt.id)) {
      errors.push({
        id: prompt.id,
        type: "duplicate",
        message: "Duplicate ID detected",
      });
    }
    ids.add(prompt.id);
  }

  // Validate bundles reference valid prompt IDs
  console.log("Validating bundles...\n");
  
  for (const bundle of bundles) {
    for (const promptId of bundle.promptIds) {
      if (!ids.has(promptId)) {
        errors.push({
          id: bundle.id,
          type: "bundle",
          message: `Bundle references non-existent prompt: ${promptId}`,
        });
      }
    }
  }

  // Validate workflows reference valid prompt IDs
  console.log("Validating workflows...\n");

  for (const workflow of workflows) {
    for (const step of workflow.steps) {
      if (!ids.has(step.promptId)) {
        errors.push({
          id: workflow.id,
          type: "workflow",
          message: `Workflow step '${step.id}' references non-existent prompt: ${step.promptId}`,
        });
      }
    }
  }

  return errors;
}

function main() {
  console.log("=".repeat(60));
  console.log("  JeffreysPrompts Validation Script");
  console.log("=".repeat(60));
  console.log();

  const errors = validate();

  if (errors.length === 0) {
    console.log(`✅ Validated ${prompts.length} prompts successfully`);
    console.log(`✅ Validated ${bundles.length} bundles successfully`);
    console.log(`✅ Validated ${workflows.length} workflows successfully`);
    console.log();
    process.exit(0);
  }

  console.error("❌ Validation failed:\n");

  // Group errors by ID
  const byId = new Map<string, ValidationError[]>();
  for (const error of errors) {
    const list = byId.get(error.id) || [];
    list.push(error);
    byId.set(error.id, list);
  }

  for (const [id, idErrors] of byId) {
    console.error(`  [${id}]`);
    for (const error of idErrors) {
      console.error(`    - [${error.type}] ${error.message}`);
    }
    console.error();
  }

  console.error(`Total: ${errors.length} error(s) in ${byId.size} item(s)`);
  process.exit(1);
}

main();
