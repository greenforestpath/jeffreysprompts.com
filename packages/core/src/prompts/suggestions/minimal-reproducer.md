---
id: minimal-reproducer
title: Minimal Reproducer Creator
description: Extract the minimal reproduction steps for a bug
category: debugging
tags:
  - debugging
  - bug
  - reproduction
  - isolation
  - ultrathink
author: Jeffrey Emanuel
twitter: "@doodlestein"
version: "1.0.0"
featured: false
difficulty: intermediate
created: "2026-01-26"
whenToUse:
  - When debugging a complex bug
  - Before filing an issue on an external project
  - When you need to isolate root cause
  - When a bug is intermittent or hard to understand
tips:
  - Start by reproducing the bug reliably
  - Remove code until the bug disappears, then add the last thing back
  - The minimal case reveals the true cause
---

Create a minimal reproduction case for this bug. Use ultrathink.

## Process

### 1. Confirm the Bug
- Can you reproduce it reliably?
- What are the exact steps to trigger it?
- What is the expected vs actual behavior?

### 2. Identify the Boundaries
- Which files/modules are involved?
- What inputs trigger the bug?
- What environment factors matter?

### 3. Reduce to Minimal Case
- Start removing code/dependencies that aren't needed
- After each removal, verify the bug still reproduces
- Continue until you can't remove anything without the bug disappearing

### 4. Document the Reproducer

**Output format:**
```
## Bug Description
[One sentence describing the bug]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Minimal Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [etc.]

## Minimal Code
[The smallest code that reproduces the issue]

## Environment
- OS:
- Node/Runtime version:
- Package versions:

## Root Cause Analysis
[Your hypothesis about why this happens]
```

### 5. Verify Minimality
- Try removing one more thing. Does the bug still happen?
- If yes, it's not minimal yet. Keep reducing.
- If no, you've found the minimal case.

The goal is the smallest possible code/steps that still demonstrate the bug. This usually reveals the root cause.
