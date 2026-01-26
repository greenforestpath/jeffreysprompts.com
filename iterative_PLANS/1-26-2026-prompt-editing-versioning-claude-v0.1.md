# Prompt Editing & Versioning System

> **Version:** 0.1
> **Created:** 2026-01-26
> **Status:** Planning

---

## Problem Statement

The current prompt system has no UI for:
- Adding new prompts
- Editing existing prompts
- Viewing version history

Prompts are hardcoded in `registry.ts`. The types support `changelog` and `version` fields but they're not used.

---

## Solution Architecture

### Core Principle: Markdown as Source of Truth

```
packages/core/src/prompts/content/*.md  (SOURCE - edit these)
        ↓ build script
packages/core/src/prompts/registry.generated.ts  (GENERATED - don't edit)
        ↓ import
apps/exodus-accelerator  (CONSUME)
```

Git provides versioning for free: history, diffs, rollback, audit.

---

## Implementation Phases

### Phase 1: Foundation (Markdown + Validation)

**1.1 Markdown as Source of Truth**
- Each prompt is a `.md` file with YAML frontmatter
- Build script compiles to TypeScript
- Zod schema validates on build

**1.2 JSON Schema Validation**
- Strict validation of all prompt fields
- Helpful error messages
- Runs at build time and API time

### Phase 2: API Layer

**2.1 CRUD Endpoints**
```
GET    /api/prompts           - List all
GET    /api/prompts/[id]      - Get one
POST   /api/prompts           - Create new
PUT    /api/prompts/[id]      - Update existing
DELETE /api/prompts/[id]      - Delete
```

**2.2 Version Endpoints**
```
GET    /api/prompts/[id]/versions   - List git history
GET    /api/prompts/[id]/versions/[hash]  - Get content at version
POST   /api/prompts/[id]/rollback   - Revert to version
```

### Phase 3: Editor UI

**3.1 Prompt Editor Component**
- Split view: editor left, preview right
- Form fields for metadata
- Textarea for content
- Live token count estimate

**3.2 Preview Mode**
- Real-time preview matching actual card styling
- Shows how prompt will appear in grid

**3.3 Save Flow**
- Change type selector (improvement/fix/breaking)
- Change summary input
- Validation before save
- Auto-version bump

### Phase 4: Version History UI

**4.1 Version List**
- Show git commits for prompt file
- Display commit message, date, hash

**4.2 Diff Viewer**
- Side-by-side or inline diff
- Compare any two versions

**4.3 Rollback**
- One-click revert to any version
- Creates new commit (preserves history)

### Phase 5: Polish

**5.1 Prompt Templates**
- Starter templates by category
- Shown when creating new prompt

**5.2 CLI Commands**
- `jfp add` - Interactive prompt creation
- `jfp edit <id>` - Open in $EDITOR
- `jfp history <id>` - Show version history

---

## File Structure After Implementation

```
packages/core/src/prompts/
├── content/                    # SOURCE OF TRUTH
│   ├── idea-wizard.md
│   ├── bug-hunter.md
│   └── ...
├── schema.ts                   # Zod validation
├── types.ts                    # TypeScript types
├── registry.generated.ts       # AUTO-GENERATED
├── templates.ts                # Starter templates
└── index.ts                    # Exports

apps/exodus-accelerator/src/
├── app/api/prompts/
│   ├── route.ts               # List + Create
│   └── [id]/
│       ├── route.ts           # Get + Update + Delete
│       └── versions/
│           └── route.ts       # History + Rollback
├── components/
│   ├── PromptEditor.tsx       # Main editor
│   ├── PromptPreview.tsx      # Live preview
│   ├── VersionHistory.tsx     # Version list
│   ├── VersionDiff.tsx        # Diff viewer
│   └── SaveDialog.tsx         # Change annotation
```

---

## Dependencies

- `gray-matter` - Parse YAML frontmatter
- `zod` - Schema validation
- `diff` - Text diffing
- Already have: Next.js, React, Tailwind

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| File system access from Next.js | Use server actions or API routes |
| Git operations from Node | Shell out to git CLI, handle errors |
| Build step forgotten | Add to CI, warn in dev mode |
| Schema drift from types | Generate types from schema |

---

## Success Criteria

1. Can create new prompt from UI
2. Can edit existing prompt from UI
3. Can view version history
4. Can diff between versions
5. Can rollback to previous version
6. All changes tracked in git
7. Validation prevents broken prompts

---

## Out of Scope (Future)

- Multi-user collaboration
- Branching/drafts
- Comments on changes
- A/B testing
- Authentication (single-user for now)
