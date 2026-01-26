// scripts/migrate-to-markdown.ts
// One-time migration: registry.ts → individual .md files

import { prompts } from "../packages/core/src/prompts/registry";
import { mkdir, writeFile } from "fs/promises";
import { stringify } from "yaml";

const CONTENT_DIR = "packages/core/src/prompts/content";

await mkdir(CONTENT_DIR, { recursive: true });

for (const prompt of prompts) {
  const { content, ...meta } = prompt;

  // Convert to YAML frontmatter
  const frontmatter = stringify(meta, {
    lineWidth: 0, // Don't wrap lines
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN",
  });

  const markdown = `---
${frontmatter.trim()}
---

${content}
`;

  const filename = `${CONTENT_DIR}/${prompt.id}.md`;
  await writeFile(filename, markdown);
  console.log(`✓ ${prompt.id}.md`);
}

console.log(`\n✅ Migrated ${prompts.length} prompts to ${CONTENT_DIR}/`);
