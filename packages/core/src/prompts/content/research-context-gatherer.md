---
id: "research-context-gatherer"
title: "Research Context Gatherer"
description: "Interview for research needs, gather codebase context, write complete research prompt to inbox"
category: "workflow"
tags: ["research", "context", "repoprompt", "interview", "inbox"]
author: "Jeffrey Emanuel"
version: "0.1.0"
difficulty: "intermediate"
featured: false
created: "2026-01-26"
---

I have an ultra-powerful research assistant available. Before I send them a research task, I need to prepare a complete, well-formed research prompt with all relevant context.

**Your job:** Interview me to understand exactly what I need researched, then help me gather the right context and write a complete research prompt.

## Step 1: Interview (3-5 questions max)

Ask me clarifying questions about:
- What specific question or problem needs research?
- What's the scope/boundary? (this repo only? external docs? specific files?)
- What format should the answer take? (summary, code examples, comparison, decision recommendation?)
- Any constraints or context I should know?

## Step 2: Gather Context

Once clear on the research need, use RepoPrompt to gather relevant context:

```bash
rp-cli -e 'context_builder instructions="<task>{{RESEARCH_QUESTION}}</task><context>{{CONSTRAINTS}}</context><discovery_agent-guidelines>{{FOCUS_HINTS}}</discovery_agent-guidelines>" response_type=clarify'
```

## Step 3: Write Research Prompt

Write the complete research prompt to:
`{{OUTPUT_DIR}}/{{TOPIC_SLUG}}-context-for-research-agent.md`

The file should contain:
1. Clear research question
2. All relevant context (from context_builder)
3. Desired output format
4. Any constraints

This prompt will be picked up from the inbox and manually given to a research agent when ready.
