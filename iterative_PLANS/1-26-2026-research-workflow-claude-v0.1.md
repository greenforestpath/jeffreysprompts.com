# Research Workflow: Context Gathering → Clean Inbox

> 2026-01-26 | claude | v0.1
> Bead: bd-tfrg

## The Vision

When encountering a problem that needs research:

```
User has question
      ↓
Research prompt (interview for clarity)
      ↓
RepoPrompt context_builder (gather relevant files)
      ↓
Write to research/inbox/{topic}-context.md
      ↓
User reviews inbox when ready
      ↓
Copy complete prompt to agent manually
```

## Key Components

### 1. Research Context Prompt (jeffreysprompts)
- Interview user for exactly what they need
- Clarify scope, constraints, desired output format
- Trigger repoprompt context_builder
- Write final research prompt to file

### 2. RepoPrompt Integration
```bash
rp-cli -e 'context_builder instructions="<task>...</task>" response_type=clarify'
```
- Returns: selected files + clarified prompt
- Can specify token budget, focus areas via `<discovery_agent-guidelines>`

### 3. Clean Inbox Pattern
- Directory: `research/inbox/` (or project-specific)
- Naming: `{topic}-context-for-research-agent.md`
- Contains: full context + well-formed prompt ready to paste

## Why This Pattern

| Benefit | Why |
|---------|-----|
| Async research | Fire and forget, review later |
| Clean handoff | Prompts are complete, not half-baked |
| Human checkpoint | User decides when/if to execute |
| Context preserved | Relevant files captured at inquiry time |

## Implementation Tasks

- [ ] Create stub prompt in jeffreysprompts
- [ ] Define inbox directory convention
- [ ] Test with real research question
- [ ] Refine prompt based on experience

## Open Questions

1. Where should inbox live? Per-project or central?
2. Should prompt auto-execute or just write to inbox?
3. How to handle multi-step research (follow-ups)?

## Notes

*(newest first)*

---

**2026-01-26: Initial capture**
- Yakshave from prompt system work
- Core idea: interview → context gather → inbox → manual handoff
