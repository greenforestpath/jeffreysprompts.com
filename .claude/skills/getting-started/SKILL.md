---
name: getting-started
description: Essential prompts for any project - ideation, documentation, and automation
version: 1.0.0
author: Jeffrey Emanuel
type: bundle
prompts: ["idea-wizard", "readme-reviser", "robot-mode-maker"]
source: https://jeffreysprompts.com/bundles/getting-started
x_jfp_generated: true
---
# Getting Started

Essential prompts for any project - ideation, documentation, and automation

## Workflow

1. **Start with Idea Wizard** - Generate and evaluate improvement ideas
2. **Document with README Reviser** - Keep docs in sync with changes
3. **Automate with Robot-Mode Maker** - Build agent-friendly CLI interfaces

## When to Use This Bundle

- When starting a new project
- When onboarding to an existing codebase
- When establishing agent-friendly workflows

---

## Included Prompts

### The Idea Wizard

*Generate 30 improvement ideas, rigorously evaluate each, distill to the very best 5*

Come up with your very best ideas for improving this project.

First generate a list of 30 ideas (brief one-liner for each).

Then go through each one systematically and critically evaluate it, rejecting the ones that are not excellent choices for good reasons and keeping the ones that pass your scrutiny.

Then, for each idea that passed your test, explain in detail exactly what the idea is (in the form of a concrete, specific, actionable plan with detailed code snippets where relevant), why it would be a good improvement, what are the possible downsides, and how confident you are that it actually improves the project (0-100%). Make sure to actually implement the top ideas now.

Use ultrathink.

**When to use:**
- When starting a new feature or project
- When reviewing a codebase for improvements
- When stuck and need creative solutions
- At the start of a coding session for fresh perspective

**Tips:**
- Run this at the start of a session for fresh perspective
- Combine with ultrathink for deeper analysis
- Focus on the top 3-5 ideas if time-constrained
- Let the agent implement ideas immediately after evaluation

---

### The README Reviser

*Update documentation for recent changes, framing them as how it always was*

Update the README and other documentation to reflect all of the recent changes to the project.

Frame all updates as if they were always present (i.e., don't say "we added X" or "X is now Y" — just describe the current state).

Make sure to add any new commands, options, or features that have been added.

Use ultrathink.

**When to use:**
- After completing a feature or significant code change
- When documentation is out of sync with code
- Before releasing a new version
- When onboarding new contributors

**Tips:**
- Run after every significant feature completion
- Check for removed features that need to be undocumented
- Ensure examples still work with current code

---

### The Robot-Mode Maker

*Create an agent-optimized CLI interface for any project*

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

**When to use:**
- When building a new CLI tool
- When adding agent-friendly features to existing CLI
- When optimizing human-centric tools for AI use

**Tips:**
- Start with the most common agent workflows
- Test output token counts to ensure efficiency
- Include fuzzy search for discoverability

---

*Bundle from [JeffreysPrompts.com](https://jeffreysprompts.com/bundles/getting-started)*
