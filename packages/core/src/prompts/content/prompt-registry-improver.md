---
id: prompt-registry-improver
title: Prompt Registry Improvement Ideator
description: Generate and evaluate ideas for improving your prompt library (outputs to suggestions queue)
category: ideation
tags:
  - meta
  - prompts
  - brainstorming
  - evaluation
  - improvement
author: Jeffrey Emanuel
twitter: "@doodlestein"
version: "1.1.0"
featured: false
difficulty: advanced
created: "2026-01-26"
whenToUse:
  - When you want to expand or improve your prompt collection
  - During periodic reviews of your prompt library
  - When onboarding to a new project and need tailored prompts
tips:
  - Run this after deeply understanding your project context
  - Use ultrathink for better quality ideation
  - The 15+ ideas phase prevents premature convergence
  - Output goes to suggestions queue for human review
---

Come up with your very best ideas for improving the Prompts in our registry.

You may suggest new ones, edit old ones, etc.

You must deeply understand the project context (and how projects relate). Then suggest human and robot prompts for better results.

Think hard and generate an abundance of **already-good** ideas (15+) (brief one-liner for each).

Then go through each one systematically and critically evaluate it, rejecting the ones that are not excellent choices for good reasons and keeping the ones that pass your scrutiny.

Then, for each idea that passed your test, explain in detail exactly what the idea is, why it would be a good improvement, what are the possible downsides, and how confident you are that it actually improves the project (0-100%).

## Output Format

**DO NOT directly create prompts.** Instead, output suggestions for human review.

For each suggestion that passed evaluation, output in this format:

```json
{
  "type": "new" | "edit",
  "targetId": "existing-prompt-id (if edit)",
  "confidence": 85,
  "rationale": "Why this improvement matters",
  "prompt": {
    "id": "suggested-slug",
    "title": "Suggested Title",
    "description": "One sentence description",
    "category": "one of: ideation, documentation, automation, refactoring, testing, debugging, workflow, communication",
    "tags": ["tag1", "tag2"],
    "content": "The full prompt content...",
    "whenToUse": ["When to use 1", "When to use 2"],
    "tips": ["Tip 1", "Tip 2"]
  }
}
```

Present all suggestions in a clear list. The human will review and approve/reject each one.

Use ultrathink.
