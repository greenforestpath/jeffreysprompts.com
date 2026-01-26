---
id: "de-slopify"
title: "The De-Slopifier"
description: "Remove telltale AI writing patterns from documentation and text"
category: "documentation"
tags:
  - "writing"
  - "documentation"
  - "editing"
  - "style"
  - "ultrathink"
author: "Jeffrey Emanuel"
twitter: "@doodlestein"
version: "1.0.0"
featured: true
difficulty: "intermediate"
estimatedTokens: 350
created: "2026-01-03"
whenToUse:
  - "After generating documentation with AI"
  - "When editing README files"
  - "When polishing any AI-generated text for human readers"
tips:
  - "Pay special attention to em dashes — they're a dead giveaway"
  - "Watch for 'Here's why' and similar AI-isms"
  - "Read the output aloud to catch unnatural phrasing"
---

I want you to read through the complete text carefully and look for any telltale signs of "AI slop" style writing; one big tell is the use of em dash. You should try to replace this with a semicolon, a comma, or just recast the sentence accordingly so it sounds good while avoiding em dash.

Also, you want to avoid certain telltale writing tropes, like sentences of the form "It's not [just] XYZ, it's ABC" or "Here's why" or "Here's why it matters:". Basically, anything that sounds like the kind of thing an LLM would write disproportionately more commonly that a human writer and which sounds inauthentic/cringe.

And you can't do this sort of thing using regex or a script, you MUST manually read each line of the text and revise it manually in a systematic, methodical, diligent way. Use ultrathink.
