# Prompt Editing & Versioning System

> **Version:** 0.2
> **Created:** 2026-01-26
> **Updated:** 2026-01-26
> **Status:** In Progress

---

## Progress Summary

### Completed (v0.1)
- [x] Markdown as source of truth (22 prompts migrated)
- [x] Zod schema with `safeValidatePrompt()`
- [x] Build script (`bun run build:prompts`)
- [x] CRUD API (POST/PUT/DELETE on `/api/prompts`)
- [x] PromptEditor component with edit/preview modes

### New Requirements (v0.2) - User Feedback
1. **Remove author/twitter from UI** - Unnecessary friction
2. **Prompt-only creation** - User inputs ONLY the prompt content, everything else (title, description, category, tags, whenToUse, tips) is AI-generated
3. **Version history sidebar** - When editing, show all previous versions with click-to-view

---

## Problem Statement

The current prompt system has no UI for:
- Adding new prompts
- Editing existing prompts
- Viewing version history

Prompts are hardcoded in `registry.ts`. The types support `changelog` and `version` fields but they're not used.

### v0.2 Problem Refinement

**Creation friction is too high.** The current editor requires filling out 10+ fields. Most users just want to paste a prompt and have everything else figured out automatically.

**Version history is invisible.** Git tracks changes but there's no UI to browse or compare previous versions.

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

### Phase 3: Editor UI ✅ (Completed, needs refactor)

**3.1 Prompt Editor Component** ✅
- Split view: editor left, preview right
- Form fields for metadata
- Textarea for content
- Live token count estimate

**3.2 Preview Mode** ✅
- Real-time preview matching actual card styling
- Shows how prompt will appear in grid

**3.3 Save Flow** (partial)
- ~~Change type selector (improvement/fix/breaking)~~ Deferred
- ~~Change summary input~~ Deferred
- Validation before save ✅
- Auto-version bump ✅

### Phase 3.5: Simplified Creation (NEW - v0.2)

**3.5.1 Prompt-Only Input**
- Single textarea for prompt content
- Big "Generate Metadata" button
- AI analyzes prompt and generates:
  - Title (concise, descriptive)
  - Description (one sentence)
  - Category (from fixed list)
  - Tags (3-5 relevant)
  - whenToUse (2-3 bullet points)
  - tips (1-2 practical hints)
  - ID (slug from title)

**3.5.2 AI Metadata Service**
- POST `/api/prompts/analyze` endpoint
- Uses Claude/OpenAI to parse prompt
- Returns structured metadata
- User can review and tweak before save

**3.5.3 UI Flow**
```
1. User pastes prompt content
2. Click "Generate Metadata"
3. AI returns suggestions (shown in collapsed section)
4. User reviews, optionally tweaks
5. Click "Save" → Creates markdown file
```

**Technical Approach:**
- API key from environment (ANTHROPIC_API_KEY or OPENAI_API_KEY)
- Fallback: manual entry if no API key
- Cache analysis results to avoid re-calling on every edit

### Phase 4: Version History UI

**4.1 Version History Sidebar** (NEW - v0.2)
- Appears in right sidebar when editing existing prompt
- Lists all previous versions with:
  - Version number (1.0.0, 1.0.1, etc.)
  - Date/time
  - First line of change summary (if any)
- Click version to view that snapshot (read-only)
- "Compare" button to diff current vs selected

**4.2 Version API**
```
GET /api/prompts/[id]/versions
  → Returns array of { version, date, hash, summary }

GET /api/prompts/[id]/versions/[hash]
  → Returns full prompt content at that version
```

**4.3 Production Consideration**
- Vercel deployments don't have .git directory
- Solution: Build-time `versions.json` artifact per prompt
- Build script extracts git log during `build:prompts`
- API reads from versions.json in production

**4.4 Diff Viewer**
- Side-by-side or inline diff
- Compare any two versions

**4.5 Rollback**
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

## Immediate Next Steps (v0.2)

1. **Remove author/twitter from PromptEditor** - Simple UI cleanup
2. **Simplify PromptEditor to prompt-only mode** - Single textarea + generate button
3. **Create `/api/prompts/analyze` endpoint** - AI metadata generation
4. **Add version history sidebar to editor** - Show previous versions when editing
5. **Create `/api/prompts/[id]/versions` endpoint** - Git-based version history

---

## Success Criteria

### v0.1 (Basic CRUD) ✅
1. ~~Can create new prompt from UI~~ ✅
2. ~~Can edit existing prompt from UI~~ ✅
3. ~~Validation prevents broken prompts~~ ✅
4. ~~All changes tracked in git~~ ✅

### v0.2 (Simplified + Versioning)
1. Can create prompt with ONLY content (AI generates metadata)
2. Can view version history when editing
3. Can view previous version content
4. Can diff between versions
5. Can rollback to previous version

---

## Out of Scope (Future)

- Multi-user collaboration
- Branching/drafts
- Comments on changes
- A/B testing
- Authentication (single-user for now)
