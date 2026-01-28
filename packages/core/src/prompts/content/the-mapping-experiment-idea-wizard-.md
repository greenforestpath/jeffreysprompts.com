---
id: the-mapping-experiment-idea-wizard-
title: 'The mapping Experiment-Idea Wizard '
description: >-
  Generate 30 improvement ideas, rigorously evaluate each, distill to the very
  best 5
category: ideation
tags:
  - brainstorming
  - improvement
  - evaluation
  - ultrathink
author: Jeffrey Emanuel
twitter: '@doodlestein'
version: 1.0.7
featured: false
difficulty: intermediate
estimatedTokens: 591
created: '2026-01-27'
updatedAt: '2026-01-27'
whenToUse:
  - When starting a new feature or project
  - When reviewing a codebase for improvements
  - When stuck and need creative solutions
  - At the start of a coding session for fresh perspective
tips:
  - Run this at the start of a session for fresh perspective
  - Combine with ultrathink for deeper analysis
  - Focus on the top 3-5 ideas if time-constrained
  - Let the agent implement ideas immediately after evaluation
---
Ok given this task come up with your very best "experiment ideas" 

We're still frankly mapping things and trying to reduce uncertainty + create usefulness

The basis of judgement is:
1) what you hope to learn 2) why valuable 3) if success: what? 4) if fail: what you will do?  

Maintain this via ip, beads, etc once I confirm the list. 

First generate a list of 30 experiment (brief one-liner for each).

Then go through each one systematically and critically evaluate it, rejecting the ones that are not excellent choices for good reasons and keeping the ones that pass your scrutiny.

Then, for each experiment-idea that passed your test, explain in detail exactly what the idea is (in the form of a concrete, specific, actionable plan with detailed code snippets where relevant), why it would be a good worth trying, what are the possible downsides, and how confident you are that it actually improves the project (0-100%). And your "Path" success or fail . I will approve from list and you go and manage the experiment-doclearnings-meaning-refinement-again-loop. 

Before launch:
- read project context deeply (use warpgrep or reporompt(if on mac)). deep analysis and primer.
- Ask any clarifications if you need before you go "Wild". and what youre general approach is (which folder or structure  or other "prepare infra" you need to go "wild" in)?


Output expectations(write to new folder inbox):
General: in each document, for each "thing"  please give linked provenance evidence(perhaps using cass) or filenames or self-contained context such that it can be fully traced and understood.

Files:
- running executive summary(easy for me to understand):  Please on running "comprehensive executive summary-learnings that is progresiively disclosed" so that I can understand what you're doing(lmk what this file is). Maximize surpsise or actionablilty 
- integration action "write" steps: a document that links to other parts of our infra . Whatever "write" really is.  This could be to update docs somewhere, re-architect some system, its basically proposals for "action steps".  RANK this. It is based on 1) confidence(0-100%) + 2) low-mid-high . 


The LONG loop:
1. exploration and deep primer
2. plan for bigger chunks of work make tasks
3. knock out tasks
4. document results, plan more intelligent,  and add more tasks 
5. repeat.

Use ultrathink.
