# Prompt System: Markdown Authoring + Live Reload

> 2026-01-26 | claude | v0.1

## The Pain / Context

**Current state:**
- 21 prompts hardcoded in single `registry.ts` (34KB)
- Adding/editing requires editing TypeScript
- No natural versioning workflow

**Goal:**
- Edit prompts as markdown files
- Instant feedback (no build step)
- Easy versioning via frontmatter

## Chosen Approach: API Reads Files Directly (Option B)

No build step. API route reads `.md` files at request time. Edit → refresh → see changes.

```
content/idea-wizard.md
        ↓
  API reads file
        ↓
  /api/prompts returns JSON
        ↓
  UI renders
```

**Why this approach:**
- Simplest possible implementation
- Zero friction authoring (edit .md, refresh browser)
- Can add build step later for production optimization if needed

## Implementation Plan

### Phase 1: File Structure Setup

Create markdown files from existing prompts:

```
packages/core/src/prompts/
├── content/                    # NEW: markdown prompt files
│   ├── idea-wizard.md
│   ├── readme-reviser.md
│   ├── robot-mode-maker.md
│   └── ... (21 files)
├── registry.ts                 # KEEP: fallback/legacy
├── types.ts                    # KEEP: type definitions
└── ...
```

**Prompt file format:**
```markdown
---
title: The Idea Wizard
description: Generate 30 improvement ideas, rigorously evaluate each
category: ideation
tags: [brainstorming, improvement, ultrathink]
author: Jeffrey Emanuel
version: 1.0.0
---

Come up with your very best ideas for improving this project.

First generate a list of 30 ideas (brief one-liner for each).
...
```

**Intelligent defaults (computed if missing):**
- `id` → derived from filename
- `created` → git first commit date (or file birthtime)
- `updatedAt` → git last modified (or file mtime)
- `estimatedTokens` → calculated on read

### Phase 2: API Route

```typescript
// apps/exodus-accelerator/src/app/api/prompts/route.ts
import { glob } from "glob";
import matter from "gray-matter";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "../../packages/core/src/prompts/content");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Read all markdown files
  const files = await glob(`${CONTENT_DIR}/*.md`);

  const prompts = await Promise.all(
    files.map(async (filePath) => {
      const raw = await Bun.file(filePath).text();
      const { data: frontmatter, content } = matter(raw);
      const filename = path.basename(filePath, ".md");

      return {
        id: frontmatter.id || filename,
        title: frontmatter.title || filename,
        description: frontmatter.description || "",
        category: frontmatter.category || "workflow",
        tags: frontmatter.tags || [],
        author: frontmatter.author || "Unknown",
        version: frontmatter.version || "1.0.0",
        content: content.trim(),
        // Computed
        estimatedTokens: Math.ceil(content.length / 4), // rough estimate
      };
    })
  );

  // Single prompt by ID
  if (id) {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(prompt);
  }

  // All prompts
  return Response.json({ prompts, count: prompts.length });
}
```

### Phase 3: Update UI to Use API

```typescript
// apps/exodus-accelerator/src/components/PromptDeck.tsx
// Change from static import to API fetch

// BEFORE:
import { prompts } from "@jeffreysprompts/core";

// AFTER:
const { data, isLoading } = useSWR("/api/prompts", fetcher);
const prompts = data?.prompts || [];
```

### Phase 4: Migration Script

One-time script to convert existing registry.ts to markdown files:

```typescript
// scripts/migrate-to-markdown.ts
import { prompts } from "../packages/core/src/prompts/registry";
import { mkdir, writeFile } from "fs/promises";

await mkdir("packages/core/src/prompts/content", { recursive: true });

for (const prompt of prompts) {
  const { content, ...meta } = prompt;

  const frontmatter = Object.entries(meta)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");

  const markdown = `---
${frontmatter}
---

${content}
`;

  await writeFile(
    `packages/core/src/prompts/content/${prompt.id}.md`,
    markdown
  );
  console.log(`✓ ${prompt.id}.md`);
}

console.log(`\nMigrated ${prompts.length} prompts.`);
```

### Phase 5: CLI Commands (Optional Enhancement)

```bash
# Add new prompt
bun prompts:add "My New Prompt"
# Creates content/my-new-prompt.md with template

# Validate all prompts
bun prompts:validate
# Checks frontmatter, required fields

# List prompts
bun prompts:list
# Shows all prompts with metadata
```

## Workflow After Implementation

```bash
# 1. Add new prompt
bun prompts:add "Code Review Helper"
# Creates content/code-review-helper.md

# 2. Edit in VS Code
code packages/core/src/prompts/content/code-review-helper.md

# 3. See changes
# Refresh browser at localhost:3001 - instant!

# 4. Version bump (manual in frontmatter)
# Change: version: 1.0.0 → version: 1.1.0

# 5. Commit
git add -A && git commit -m "Add code review helper prompt"
```

## File Format Reference

**Minimal (required only):**
```markdown
---
title: My Prompt
---

The prompt content.
```

**Full (all fields):**
```markdown
---
title: My Prompt
description: One-line description for cards
category: ideation
tags: [tag1, tag2]
author: Jeffrey Emanuel
twitter: "@doodlestein"
version: 1.2.0
difficulty: intermediate
featured: true
created: 2025-01-09
updatedAt: 2026-01-26
changelog:
  - version: "1.2.0"
    date: "2026-01-26"
    type: improvement
    summary: Added evaluation criteria
whenToUse:
  - When starting a new project
  - When reviewing code
tips:
  - Run at session start
  - Combine with ultrathink
---

The prompt content here.

Supports **markdown** formatting.

Variables like {{PROJECT_NAME}} are supported.
```

## Tasks

- [ ] Create `content/` directory
- [ ] Run migration script (21 prompts → .md files)
- [ ] Create `/api/prompts` route
- [ ] Update PromptDeck to fetch from API
- [ ] Add `gray-matter` dependency
- [ ] Test: edit .md → refresh → see change
- [ ] (Optional) Add `prompts:add` CLI command
- [ ] (Optional) Add `prompts:validate` CLI command

## Open Questions

1. **Keep registry.ts as fallback?**
   - Yes for now, can remove later once stable

2. **Production optimization?**
   - API reads work fine for ~100 prompts
   - Add caching header if needed
   - Build step only if performance becomes issue

3. **Variable extraction?**
   - Auto-detect `{{VAR}}` patterns in content?
   - Add to Phase 2 or later enhancement?

## Notes

*(newest first)*

---

**2026-01-26: Chose Option B**
- No build step, API reads .md files directly
- Simplest approach, instant feedback
- Can optimize later if needed
