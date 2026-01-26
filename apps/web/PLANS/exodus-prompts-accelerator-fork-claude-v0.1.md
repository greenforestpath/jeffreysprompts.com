# PLAN: ExodusPromptsAccelerator - Simplified Frontend

**Plan version:** v0.2
**Status:** Ready for Implementation
**Created:** 2026-01-25
**Author:** Claude (with user direction)

---

## Decision Record

**Decision:** Create a new simplified frontend called "ExodusPromptsAccelerator" within the jeffreysprompts.com monorepo.

**Rationale:**
- Keep ONE prompt registry (shared `@jeffreysprompts/core`)
- Pull Jeffrey's changes later if interesting (TODO: revisit upstream sync)
- Different frontend: simpler, no login/signup, Prompt Deck focused
- Same backend + different frontend architecture

---

## Design Philosophy: Perpetual Self-Improvement Loop

The Analysis pane exists to close the feedback loop:

```
USE prompts → generates usage data
     ↓
ANALYZE usage → reveals patterns (what you reach for, what's missing)
     ↓
SUGGEST improvements → "you might need X based on Y pattern"
     ↓
ADD to deck → deck evolves with you
     ↓
REPEAT
```

This is NOT a static prompt library. It's a **living system** that gets smarter about YOUR workflow over time.

The "I'm Feeling Lucky" button is a **forcing function**:
- Forces you to LOOK at your data
- Surfaces the suggestion (even if dumb/stub now)
- Reminds you: "this deck should evolve"

**Future intelligence (stub for now):**
- Pattern detection: "You always use X before Y"
- Gap analysis: "You have no prompts for Z category"
- Frequency decay: "You stopped using X, archive it?"
- External suggestions: "Based on CASS sessions, you need..."

---

## Storage Architecture

### Decision: Git-tracked JSONL

Usage data MUST be git-tracked. This gives:
- History (git log shows usage over time)
- Sync (push/pull between machines)
- CLI analysis (`jq`, `grep`, import to beads)
- No external dependencies

### Data Structure

```typescript
interface UsageEvent {
  prompt_id: string;   // e.g., "idea-wizard"
  ts: number;          // Unix ms, Date.now()
  category: string;    // e.g., "ideation"
}
```

### File Location

```
apps/exodus-accelerator/
├── data/
│   └── usage.jsonl     ← git-tracked, append-only
```

### Write Flow

```
Browser (click tile)
    │
    ▼
POST /api/usage { prompt_id, category }
    │
    ▼
API Route: appendFileSync('data/usage.jsonl', JSON.stringify(event) + '\n')
    │
    ▼
Git commit (manual or periodic)
```

### API Route

```typescript
// src/app/api/usage/route.ts
import { appendFileSync } from 'fs';
import { join } from 'path';

export async function POST(req: Request) {
  const { prompt_id, category } = await req.json();
  const event = { prompt_id, ts: Date.now(), category };

  appendFileSync(
    join(process.cwd(), 'data/usage.jsonl'),
    JSON.stringify(event) + '\n'
  );

  return Response.json({ ok: true });
}
```

### CLI Analysis

```bash
# Top prompts all time
jq -s 'group_by(.prompt_id) | map({id: .[0].prompt_id, count: length}) | sort_by(-.count)' data/usage.jsonl

# This week
jq -s --argjson week $(($(date +%s)*1000 - 604800000)) '[.[] | select(.ts > $week)]' data/usage.jsonl

# Category breakdown
jq -s 'group_by(.category) | map({cat: .[0].category, count: length})' data/usage.jsonl
```

---

## Architecture

```
jeffreysprompts.com/
├── packages/
│   └── core/                    # SHARED - prompt registry, types
├── apps/
│   ├── web/                     # Jeffrey's full-featured app (port 3000)
│   └── exodus-accelerator/      # NEW - simplified Prompt Deck (port 3001)
```

---

## Codebase Anatomy: KEEP vs DISCARD

### KEEP (Core Value)

| Component/File | Purpose |
|----------------|---------|
| `PromptDeckOverlay.tsx` | **THE core feature** - adapt as main page |
| `@jeffreysprompts/core` | Prompt registry (shared) |
| `CategoryFilter.tsx` | Filter by category |
| `clipboard.ts` | Copy to clipboard |
| `toast.tsx` | Copy feedback |
| `theme-provider.tsx` | Dark mode |
| `SpotlightSearch.tsx` | Cmd+K search |
| `useLocalStorage.ts` | Preferences + usage tracking |
| Basic UI components | Foundation |

### DISCARD (Not Needed)

| Feature | Reason |
|---------|--------|
| Auth/Users | No accounts |
| API Routes | No backend (for MVP) |
| Social (ratings, comments) | Overkill |
| Cookie Consent | No marketing tracking |
| i18n | English only |
| Admin/Moderation | No accounts |

### INCLUDE (Self-Analytics + Improvement Loop)

| Feature | Purpose |
|---------|---------|
| Usage tracking (git-tracked JSONL) | Record each copy, sync across machines |
| Analysis Dashboard | View usage patterns, categories, timeline |
| Suggested Prompt | Intelligent recommendation based on usage (stub for MVP) |
| "I'm Feeling Lucky" button | Forcing function for self-improvement loop |

---

## App Structure

```
apps/exodus-accelerator/
├── data/
│   └── usage.jsonl            # Git-tracked usage events
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Minimal: html, body, providers
│   │   ├── page.tsx           # Main page with pane switching
│   │   └── api/
│   │       └── usage/
│   │           └── route.ts   # POST handler: append to usage.jsonl
│   ├── components/
│   │   ├── PromptDeck.tsx     # Grid of tiles (primary pane)
│   │   ├── PromptTile.tsx     # Single clickable tile
│   │   ├── CategoryFilter.tsx # Category chips
│   │   ├── SearchBar.tsx      # Simple search (or Cmd+K)
│   │   ├── AnalysisDashboard.tsx  # Analytics pane
│   │   ├── UsageStats.tsx     # Top prompts, category breakdown
│   │   ├── SuggestedPrompt.tsx    # Intelligent recommendation (stub)
│   │   ├── UsageTimeline.tsx  # Sparkline of recent activity
│   │   └── ui/
│   │       └── toast.tsx      # Copy feedback
│   ├── lib/
│   │   ├── clipboard.ts       # Copy helper
│   │   ├── usage.ts           # Usage tracking (POST to API)
│   │   ├── analysis.ts        # Read/parse usage.jsonl, compute stats
│   │   ├── suggestions.ts     # Prompt suggestion logic (stub)
│   │   └── utils.ts           # cn() helper
│   └── hooks/
│       └── useUsageData.ts    # Fetch + cache usage data
├── package.json
├── next.config.ts
└── README.md
```

---

## UX Flow: Two-Pane Architecture

### Pane 1: Prompt Deck (Primary/Default)

```
┌────────────────────────────────────────────────────────────┐
│  ExodusPromptsAccelerator                    [📊] [🌙]     │
├────────────────────────────────────────────────────────────┤
│  [All] [Ideation] [Documentation] [Automation] [...]       │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 💡 Idea     │  │ 📄 README   │  │ 🤖 Robot    │        │
│  │ Wizard      │  │ Reviser     │  │ Mode Maker  │        │
│  │ Used: 47x   │  │ Used: 23x   │  │ Used: 12x   │        │
│  │ [Click=Copy]│  │ [Click=Copy]│  │ [Click=Copy]│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├────────────────────────────────────────────────────────────┤
│  12 prompts • 82 copies this week                          │
│                                                            │
│            [🎲 I'm Feeling Lucky / Analysis]               │
└────────────────────────────────────────────────────────────┘
```

### Pane 2: Analysis Dashboard (via button click)

```
┌────────────────────────────────────────────────────────────┐
│  ExodusPromptsAccelerator - Analysis         [← Back]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │ YOUR USAGE              │  │ SUGGESTED PROMPT        │ │
│  │                         │  │                         │ │
│  │ Top 5 this week:        │  │ 💡 Based on your usage: │ │
│  │ 1. idea-wizard (12)     │  │                         │ │
│  │ 2. readme-rev (8)       │  │ "You use ideation       │ │
│  │ 3. robot-mode (5)       │  │  prompts 3x more than   │ │
│  │ 4. ...                  │  │  documentation.         │ │
│  │                         │  │                         │ │
│  │ Categories:             │  │  Consider adding:       │ │
│  │ ██████░░ ideation  60%  │  │  'Quick Brainstorm'     │ │
│  │ ███░░░░░ docs      25%  │  │  for faster idea bursts"│ │
│  │ ██░░░░░░ auto      15%  │  │                         │ │
│  │                         │  │ [+ Add to Deck] (stub)  │ │
│  └─────────────────────────┘  └─────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ USAGE TIMELINE                                      │  │
│  │ ▁▃▅▇█▅▃▁▂▄▆▇█▆▄▂  (last 30 days)                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Key elements:**
- **Usage stats**: Top prompts, category breakdown, timeline
- **Suggested prompt**: Intelligent recommendation (stub for MVP, real later)
- **"Add to Deck"**: Future feature to add suggested prompts
- **Back button**: Returns to Prompt Deck

---

## Implementation Plan

### Phase 1: Scaffold + Prompt Deck

1. Create `apps/exodus-accelerator/` with Next.js
2. Copy essential files from `apps/web/`
3. Adapt PromptDeckOverlay → PromptDeck (full page, primary pane)
4. Set port to 3001
5. Basic tile grid with click-to-copy

### Phase 2: Usage Tracking (Git-backed)

1. Create `data/usage.jsonl` (empty, git-tracked)
2. Create API route `POST /api/usage` that appends to JSONL
3. Hook copy action to POST usage event
4. Display usage counts on tiles (read from JSONL on load)

### Phase 3: Analysis Dashboard

1. Create AnalysisDashboard component
2. Add "I'm Feeling Lucky / Analysis" button to Prompt Deck
3. Implement pane switching (state-based, not routing)
4. UsageStats: top prompts, category breakdown
5. UsageTimeline: sparkline of recent activity
6. SuggestedPrompt: stub that returns placeholder recommendation

### Phase 4: Polish + Documentation

1. Add search (Cmd+K or search bar)
2. Category filter chips
3. Update root README with fork note
4. Add `apps/exodus-accelerator/README.md`

---

## Port Assignment

| App | Port | Purpose |
|-----|------|---------|
| apps/web | 3000 | Full JeffreysPrompts.com |
| apps/exodus-accelerator | 3001 | Simplified Prompt Deck |

---

## Verification

### Prompt Deck (Primary)
1. `cd /Users/personal/Projects/CFWOS/jeffreysprompts.com`
2. `bun run dev:accelerator`
3. Open http://localhost:3001
4. See Prompt Deck grid immediately
5. Click tile → copies to clipboard + usage count increments
6. Usage count visible on tile
7. Check `data/usage.jsonl` has new line appended

### Analysis Dashboard
8. Click "I'm Feeling Lucky / Analysis" button
9. See usage stats (top prompts, category breakdown)
10. See suggested prompt (stub: placeholder text)
11. Click "Back" → returns to Prompt Deck

### CLI Analysis
```bash
cd apps/exodus-accelerator
jq -s 'group_by(.prompt_id) | map({id: .[0].prompt_id, count: length}) | sort_by(-.count)' data/usage.jsonl
```

---

## Learnings Log

**2026-01-25: Git-tracked storage decision**
- User explicitly wanted git-tracked file, not localStorage
- JSONL in repo gives: history, sync, CLI analysis, no external deps
- API route with appendFileSync is simple and works

**2026-01-25: Analysis Dashboard philosophy**
- Not just stats display—it's a "forcing function" for self-improvement
- "I'm Feeling Lucky" button reminds user: "this deck should evolve"
- Suggested prompt feature (even as stub) plants the seed for intelligent recommendations
- The feedback loop: USE → ANALYZE → SUGGEST → ADD → REPEAT
