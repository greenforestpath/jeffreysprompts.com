# Suggestions Queue System (v0.3)

> **Created:** 2026-01-26
> **Status:** Integration Complete, Testing Needed
> **Plan:** `iterative_PLANS/1-26-2026-prompt-editing-versioning-claude-v0.1.md`

---

## Focus

**Now:** Test the full suggestions flow end-to-end
**Next:** Approve/reject suggestions via UI, verify rebuild works
**Blocked:** None
**Files:**
- `apps/exodus-accelerator/src/components/SuggestionsPane.tsx` - NEW
- `apps/exodus-accelerator/src/components/PromptDeck.tsx` - Modified (tabs, integration)
- `apps/exodus-accelerator/src/app/api/prompts/suggestions/route.ts` - NEW
- `packages/core/src/prompts/suggestions/` - 6 pending prompts + index.json

---

## Key Decisions

- **View → Edit → Approve Flow**: User can view suggestion, click "Edit" to open in PromptEditor (pre-filled), modify, then save as new prompt. Alternatively, "Approve" accepts as-is.
- **Suggestions stored as .md files**: Same format as content prompts, keeps things consistent.
- **Tab-based UI**: Prompts/Suggestions toggle in header rather than sidebar.
- **AI-generated prompts go to queue**: prompt-registry-improver outputs JSON to queue, NOT direct creation.

---

## What Was Built

### 1. API (`/api/prompts/suggestions`)
- `GET`: Returns all suggestions with file content
- `PUT`: Approve (moves to content/), Reject (marks status), Edit (updates file)
- `DELETE`: Removes suggestion and file permanently

### 2. UI (`SuggestionsPane.tsx`)
- Expandable cards showing title, confidence, type (new/edit)
- Rationale and content preview in expanded view
- Action buttons: Approve, Edit, Reject, Delete
- Separates pending vs previously reviewed

### 3. Integration (`PromptDeck.tsx`)
- Added Prompts/Suggestions tab toggle in header
- Badge shows pending count
- "Edit" on suggestion opens PromptEditor in create mode with pre-filled data
- After approval, reloads both prompts and suggestion count

### 4. Current Queue
6 suggestions pending review (90-80% confidence):
- security-auditor (90%)
- agent-handoff (92%)
- quick-fix (88%)
- communication-drafter (85%)
- minimal-reproducer (80%)
- dependency-auditor (82%)

---

## Remaining Work

### Immediate (v0.3 completion)
1. **Test suggestions flow** - Click through approve/reject/edit cycle
2. **Verify rebuild** - After approving, run `bun run build:prompts`
3. **Test edit flow** - Click "Edit", modify, save → creates new prompt

### Future (v0.4+)
1. **Version history sidebar** - Show git history when editing existing prompts
2. **Diff viewer** - Compare current vs previous versions
3. **Rollback** - One-click revert to previous version
4. **CLI commands** - `jfp suggestions`, `jfp approve <id>`

---

## How to Test

```bash
# Start dev server
cd apps/exodus-accelerator && bun run dev

# Navigate to http://localhost:3000
# Click "Suggestions" tab (should show 6 pending)
# Expand a suggestion, review content
# Click "Approve" → should move to content/, rebuild prompt
# Click "Edit" → should open editor with pre-filled data
# Click "Reject" → should mark as rejected, stay in list
```

---

## Entry Point for Next Session

```
resume BUILD-suggestions-queue
```

Read this handoff, then test the suggestions flow. If working, approve a few suggestions and verify the rebuild process.
