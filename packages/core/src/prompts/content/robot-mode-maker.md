---
id: "robot-mode-maker"
title: "The Robot-Mode Maker"
description: "Create an agent-optimized CLI interface for any project"
category: "automation"
tags:
  - "cli"
  - "automation"
  - "agent"
  - "robot-mode"
  - "ultrathink"
author: "Jeffrey Emanuel"
twitter: "@doodlestein"
version: "1.0.0"
featured: true
difficulty: "advanced"
estimatedTokens: 600
created: "2025-01-09"
whenToUse:
  - "When building a new CLI tool"
  - "When adding agent-friendly features to existing CLI"
  - "When optimizing human-centric tools for AI use"
tips:
  - "Start with the most common agent workflows"
  - "Test output token counts to ensure efficiency"
  - "Include fuzzy search for discoverability"
---

Design and implement a "robot mode" CLI for this project.

The CLI should be optimized for use by AI coding agents:

1. **JSON Output**: Add --json flag to every command for machine-readable output
2. **Quick Start**: Running with no args shows help in ~100 tokens
3. **Structured Errors**: Error responses include code, message, suggestions
4. **TTY Detection**: Auto-switch to JSON when piped
5. **Exit Codes**: Meaningful codes (0=success, 1=not found, 2=invalid args, etc.)
6. **Token Efficient**: Dense, minimal output that respects context limits

Think about what information an AI agent would need and how to present it most efficiently.

Use ultrathink to design the interface before implementing.
