---
id: agent-handoff
title: Agent Handoff
description: Prepare work state for handoff to another agent or future session
category: workflow
tags:
  - handoff
  - continuity
  - documentation
  - session
author: Jeffrey Emanuel
twitter: "@doodlestein"
version: "1.0.0"
featured: true
difficulty: beginner
created: "2026-01-26"
whenToUse:
  - Before ending a long session
  - When handing work to another agent
  - Before context compaction
  - When work is blocked and needs to be resumed later
tips:
  - Run this BEFORE you lose context, not after
  - The output should let a fresh agent resume without ramp-up
  - Include specific file paths and line numbers
---

Prepare a complete handoff document for whoever continues this work (another agent or a future session).

## Required Sections

### 1. Current State
- What was the original goal/task?
- What has been completed?
- What is the current state of the code?

### 2. In Progress
- What were you actively working on when stopped?
- Any half-finished changes or uncommitted work?
- Files currently modified (list with brief description of changes)

### 3. Blockers & Open Questions
- What is blocking progress?
- What decisions need to be made?
- What questions need answers from the user?

### 4. Next Steps
- Concrete, numbered list of what to do next
- In priority order
- Each step should be actionable without additional context

### 5. Key Files
- List the 3-5 most important files for this work
- Brief description of what each does
- Any tricky parts to watch out for

### 6. Context That Would Be Lost
- Any non-obvious discoveries or learnings
- Failed approaches (so they aren't re-tried)
- Important constraints or requirements

## Output Format

Write this to: `thoughts/handoffs/{TASK_SLUG}-handoff.md`

The document should be self-contained. A fresh agent reading only this file should be able to continue the work effectively.
