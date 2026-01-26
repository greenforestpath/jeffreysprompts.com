---
id: "cli-error-tolerance"
title: "CLI Error Tolerance"
description: "Make CLI tools forgiving of minor syntax issues for agent ergonomics"
category: "automation"
tags:
  - "cli"
  - "agent-friendly"
  - "error-handling"
  - "ultrathink"
author: "Jeffrey Emanuel"
twitter: "@doodlestein"
version: "1.0.0"
featured: false
difficulty: "intermediate"
estimatedTokens: 450
created: "2025-09-17"
whenToUse:
  - "When building CLIs that agents will use"
  - "To improve agent-tool interaction success rates"
  - "After Robot-Mode Maker to enhance the interface"
tips:
  - "Complements Robot-Mode Maker"
  - "Reduces agent frustration with strict syntax"
  - "Include teaching notes in error responses"
---

One thing that's critical for the robot mode flags in the CLI (the mode intended for use by AI coding agents like yourself) is that we want to make it easy for the agents to use the tool; so first off, we want to make the CLI interface and system as intuitive and easy as possible and explain it super clearly in the CLI help and in a blurb in AGENTS.md. But beyond that, we want to be maximally flexible when the intent of a command is clear but there's some minor syntax issue; basically we'd like to honor all commands where the intent is legible (although in those cases we might want to precede the response with some note instructing the agent how to more correctly issue that command in the future). If we can't really figure out reliably what the agent is trying to do, then we should always return a super detailed and helpful/useful error message that lets the agent understand what it did wrong so it can do it the right way next time; we should give them a couple relevant correct examples in the error message about how to do what we might reasonably guess they are trying (and failing) to do with their wrong command. Use ultrathink.
