---
id: quick-fix
title: Quick Fix
description: Fast, focused fix for small issues without deep codebase exploration
category: debugging
tags:
  - fix
  - quick
  - focused
  - minimal
author: Jeffrey Emanuel
twitter: "@doodlestein"
version: "1.0.0"
featured: false
difficulty: beginner
created: "2026-01-26"
whenToUse:
  - For obvious bugs with clear fixes
  - Single-file changes
  - When you already know exactly what needs to change
  - Small features or tweaks
tips:
  - Don't use this for complex multi-file changes
  - If unsure, use deep-project-primer first
  - Verify the fix doesn't break related functionality
---

Fix this specific issue quickly and precisely. Don't explore the broader codebase unless necessary.

## Approach

1. **Understand the specific issue** - What exactly is wrong or needs to change?
2. **Locate the relevant code** - Find the exact file(s) and line(s)
3. **Make the minimal fix** - Change only what's necessary
4. **Verify the fix** - Ensure it works and doesn't break related code
5. **Done** - Don't gold-plate or refactor surrounding code

## Rules

- Stay focused on the specific issue
- Don't refactor unrelated code
- Don't add features beyond what was requested
- Don't deep-dive into project architecture
- If the fix requires understanding more context, say so

## Output

Brief description of what was changed and why. No extensive explanations needed.
