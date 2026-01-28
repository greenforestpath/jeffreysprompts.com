---
id: code-reorganizer
title: The Code Reorganizer
description: 'Restructure scattered code files into a sensible, intuitive folder structure'
category: refactoring
tags:
  - refactoring
  - organization
  - structure
  - cleanup
  - ultrathink
author: Jeffrey Emanuel
twitter: '@doodlestein'
version: 1.0.1
featured: false
difficulty: advanced
estimatedTokens: 565
created: '2025-08-07'
updatedAt: '2026-01-27'
whenToUse:
  - When your codebase has grown organically and become messy
  - When onboarding new developers is difficult due to confusing structure
  - When you can't find files intuitively
tips:
  - Replace 'x' and 'y' with your actual folder/feature names
  - Make sure no other agents are running when implementing the plan
  - Always review the plan document before execution
---
We really have WAY too many code files scattered inside src/x with no rhyme or reason to the structure and location of code files; I feel like we could make things a lot more organized, logical, intuitive, etc. by reorganizing these into a nice, sensible folder structure, although I don't want something that has too many levels of nesting; basically, we should at least start out with making "no brainer" type changes to the folder structure, like putting all the "x" functionality-related code files into an "x" folder (and perhaps that inside of a data_sources folder which might also contain a "y" folder, etc.).

Before making any of these changes, I really need you to take the time to explore and read ALL of the many, many files in that folder and understand what they do, how they fit together, which code files import which others, how they interact in functional ways, etc., and then propose a reorganization plan in a new iterative plan document {date}-proposed-code-file-reorgnization-documentation-plan.md so I can review it before doing anything; this plan should include not just your detailed reorganization plan but the super-detailed rationale and justification for your proposed file/folder structure and why you think it's optimal for aiding any developer or coding agent working on this project to immediately and intuitively understand the project structure and where to look for things, etc. You must also update and fix any broken documentation and outdated stale-confusing states.

I'm also open to merging/consolidating/splitting individual code files; if we have multiple small related code files that you think should be combined into a single code file, explain why. If you think any particular code files are WAY too big and really should be refactored into several smaller code files, then explain that too and your proposed strategy for how to restructure them.

Always keep in mind, and track in this plan document, changes you will need to make to any calling code to properly reflect the new folder structure and file structure so that we don't break anything. I don't want to discover after you do all this that nothing works anymore and we have to do a massive slog to get anything running again properly. Use ultrathink.
