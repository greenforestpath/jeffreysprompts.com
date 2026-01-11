/**
 * Static annotations for the "How It Was Made" transcript page.
 * These editorial comments are merged with ProcessedTranscript at render time.
 *
 * To add an annotation:
 * 1. Find the message ID from the transcript JSON
 * 2. Add an entry to the annotations map below
 * 3. Choose the appropriate type for the insight
 */

import { type TranscriptHighlight } from "@/lib/transcript/types";

/**
 * Annotation types and their meanings:
 * - key_decision: Major architectural or technical decisions
 * - interesting_prompt: Notable prompting techniques or patterns
 * - clever_solution: Elegant implementations or problem-solving approaches
 * - lesson_learned: Insights that could help future development
 */

/**
 * Map of message IDs to their annotations.
 * Keyed by message ID for O(1) lookup when rendering.
 */
export const annotationsMap: Record<string, Omit<TranscriptHighlight, "messageId">> = {
  // Project Kickoff - The original prompt that started it all
  "msg-0": {
    type: "interesting_prompt",
    annotation:
      "The initial prompt that sparked the entire project - including the three 'favorite prompts' that would become the foundation of the site's content.",
  },

  // Key architectural decision - TypeScript-native prompts
  "msg-15": {
    type: "key_decision",
    annotation:
      "Chose TypeScript-native prompts over markdown files. This eliminates parsing, provides type safety, and enables IDE autocomplete for all prompt fields.",
  },

  // BM25 Search Engine
  "msg-91": {
    type: "clever_solution",
    annotation:
      "Implemented custom BM25 search with weighted fields (title 3x, description 2x, tags 1.5x, content 1x). Much better relevance than simple text matching.",
  },

  // CLI Design Philosophy
  "msg-142": {
    type: "key_decision",
    annotation:
      "Agent-first CLI design: JSON output by default when piped, token-dense quick-start mode (~100 tokens), and meaningful exit codes for programmatic parsing.",
  },

  // Cursor tracking glow effect
  "msg-295": {
    type: "clever_solution",
    annotation:
      "PromptCard cursor-tracking glow effect using Framer Motion. Tracks mouse position to create a dynamic radial gradient that follows the cursor.",
  },

  // SpotlightSearch implementation
  "msg-369": {
    type: "key_decision",
    annotation:
      "SpotlightSearch (Cmd+K) as the primary discovery mechanism. Combines fuzzy search with recent history, category filtering, and keyboard navigation.",
  },

  // Skill manifest system
  "msg-554": {
    type: "clever_solution",
    annotation:
      "Skill manifest tracks installed prompts with SHA256 hashes. Detects user modifications to prevent accidental overwrites during updates.",
  },

  // Robot Mode philosophy
  "msg-667": {
    type: "lesson_learned",
    annotation:
      "The Robot-Mode Maker prompt in action: build tooling YOU would want to use. The CLI was designed by Claude, for Claude (and other agents).",
  },

  // Build process
  "msg-798": {
    type: "lesson_learned",
    annotation:
      "Single-file Bun binary compilation. The entire CLI compiles to one executable with no runtime dependencies - true portability.",
  },

  // Final polish
  "msg-1100": {
    type: "lesson_learned",
    annotation:
      "8 hours from first prompt to deployed site. The key was having clear patterns from brenner_bot to follow and systematic execution.",
  },
};

/**
 * Guide steps used by the annotated build guide.
 * These sit alongside transcript sections to explain what changed at each phase.
 */
export interface GuideStep {
  sectionId: string;
  narrative: string;
  excerpts?: string[];
  outcomes: string[];
  artifacts: string[];
  revisions?: Array<{ id: string; label: string }>;
  planPanel?: boolean;
  xRefs?: string[];
}

export interface WorkflowPost {
  id: string;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  stepIds: string[];
  tone: "planning" | "coordination" | "prompting" | "ux";
}

export const guideSteps: GuideStep[] = [
  {
    sectionId: "section-0",
    narrative:
      "We started by translating the original prompt tweets into a full product brief, then locked the plan before writing code. This is the signature move: spend the human effort up front so execution is fast, aligned, and low-drama. It is deliberately different from the typical \"just start coding\" approach — the plan is the product spec, and the prompts are the operating system.",
    excerpts: [
      "The first move is to turn the prompt tweets into a real scope document.",
      "Planning is treated as the highest leverage phase, not a formality.",
    ],
    outcomes: [
      "Mapped prompt tweets into a full product scope (web + CLI).",
      "Adopted brenner_bot as the design and stack reference point.",
      "Produced the end-to-end build plan to drive execution.",
    ],
    artifacts: [
      "PLAN_TO_MAKE_JEFFREYSPROMPTS_WEBAPP_AND_CLI_TOOL.md",
      "AGENTS.md",
    ],
    planPanel: true,
    revisions: [
      { id: "packages-core", label: "Shared core package" },
      { id: "bm25-search", label: "BM25 search ranking" },
      { id: "cac-parser", label: "CAC CLI parser" },
      { id: "skill-manifest", label: "Skill manifest hashing" },
      { id: "yaml-safe", label: "YAML-safe frontmatter" },
    ],
    xRefs: [
      "2008027253817712704",
      "2008813484348153961",
      "1999969044561375694",
      "1999979218378297623",
    ],
  },
  {
    sectionId: "section-1",
    narrative:
      "Prompts became typed TypeScript objects so the registry is the source of truth for every surface (web, CLI, exports). The \"data is code\" choice avoids brittle markdown parsing and keeps changes precise, which matters when prompts are the product itself. This is different from most prompt libraries that treat content as static files.",
    excerpts: [
      "The registry is a real code module, not a folder of markdown files.",
      "Types lock in categories, metadata, and prompt shape early.",
    ],
    outcomes: [
      "Established the monorepo layout for core, CLI, and web packages.",
      "Defined prompt/category/meta types as the single source of truth.",
      "Set the registry contract that every feature relies on.",
    ],
    artifacts: [
      "packages/core/src/prompts/types.ts",
      "packages/core/src/prompts/registry.ts",
      "packages/core/src/index.ts",
    ],
    revisions: [{ id: "packages-core", label: "Shared core package" }],
    xRefs: ["1939000599242252607"],
  },
  {
    sectionId: "section-2",
    narrative:
      "Search relevance was solved early with deterministic BM25 scoring. We deliberately avoided embeddings here because the catalog needs stable, explainable ranking that agents can trust across runs. This is part of the broader philosophy: build mechanical systems first, then add fancy layers only if needed.",
    excerpts: [
      "Weighted fields make the system surface what humans actually care about.",
      "Deterministic search beats fuzzy guesses when prompts are code.",
    ],
    outcomes: [
      "Implemented BM25 scoring with weighted fields for better relevance.",
      "Built the search pipeline: tokenize, score, rank, and return.",
      "Added export helpers for markdown, YAML, and skill formats.",
    ],
    artifacts: [
      "packages/core/src/search/bm25.ts",
      "packages/core/src/search/engine.ts",
      "packages/core/src/export/markdown.ts",
    ],
    revisions: [{ id: "bm25-search", label: "BM25 search ranking" }],
  },
  {
    sectionId: "section-3",
    narrative:
      "The web app was built quickly but intentionally: strong hero, clear navigation, and a UI system tuned for prompt browsing. The UI/UX prompt used in other projects shows up here too — iterate aggressively on layout and polish so the interface feels deliberate rather than template-driven.",
    excerpts: [
      "Layout and hero came first so the rest of the UI had a visual anchor.",
      "Reusable components were designed to scale across search and cards.",
    ],
    outcomes: [
      "Bootstrapped the Next.js 16 App Router foundation.",
      "Established Tailwind 4 + shadcn/ui styling patterns.",
      "Built the initial layout, navigation, and hero system.",
    ],
    artifacts: [
      "apps/web/src/app/page.tsx",
      "apps/web/src/components/Nav.tsx",
      "apps/web/src/components/Hero.tsx",
    ],
    xRefs: ["2007194101448573036"],
  },
  {
    sectionId: "section-4",
    narrative:
      "The CLI is treated as a first-class agent surface, not a secondary tool: fuzzy search, JSON/markdown modes, and skill installation are all tuned for automation and token efficiency. This is where the Robot-Mode prompt philosophy shows up — build tools the agents can run reliably, then let them scale the work.",
    excerpts: [
      "The CLI defaults to agent-friendly output, not human-friendly verbosity.",
      "Skill install/export workflows are designed for automated pipelines.",
    ],
    outcomes: [
      "Built the `jfp` CLI entrypoint and command registry.",
      "Added fuzzy search plus JSON/markdown output modes.",
      "Enabled prompt export and skill installation workflows.",
    ],
    artifacts: [
      "packages/cli/src/index.ts",
      "packages/cli/src/commands/search.ts",
      "packages/cli/src/commands/export.ts",
    ],
    revisions: [
      { id: "cac-parser", label: "CAC CLI parser" },
      { id: "prompt-variables", label: "Prompt templating" },
      { id: "skill-manifest", label: "Skill manifest hashing" },
    ],
    xRefs: [
      "1984344027576033619",
      "2006261780218265758",
      "2006557029964607785",
      "1995863013987868954",
    ],
  },
  {
    sectionId: "section-5",
    narrative:
      "User-facing workflows snapped into place: Spotlight search, prompt cards, and the basket flow for bulk export. The goal is throughput — letting you explore, collect, and ship prompts quickly without the friction most catalogs impose.",
    excerpts: [
      "Spotlight became the primary discovery mechanism to keep search fast.",
      "The basket flow makes multi-prompt export a single gesture.",
    ],
    outcomes: [
      "Shipped SpotlightSearch (Cmd+K) for prompt discovery.",
      "Designed prompt cards with copy and quick actions.",
      "Implemented the basket workflow for bulk downloads.",
    ],
    artifacts: [
      "apps/web/src/components/SpotlightSearch.tsx",
      "apps/web/src/components/PromptCard.tsx",
      "apps/web/src/components/BasketSidebar.tsx",
    ],
    revisions: [{ id: "changelog", label: "Prompt changelog" }],
    xRefs: ["2007194101448573036"],
  },
  {
    sectionId: "section-6",
    narrative:
      "The final stretch was about trust and portability: hardening tests, refining docs, and producing a single-file CLI binary. This is the less flashy part of the workflow, but it is what lets agents (and humans) rely on the tooling without surprises.",
    excerpts: [
      "Test coverage and docs were tightened before calling it done.",
      "The binary build step was treated like a core product feature.",
    ],
    outcomes: [
      "Expanded tests and hardened edge cases before shipping.",
      "Polished docs and release scripts for distribution.",
      "Prepared single-binary builds with Bun.",
    ],
    artifacts: [
      "packages/cli/__tests__/commands/json-schema-golden.test.ts",
      "README.md",
      "scripts/build-cli.sh",
    ],
    revisions: [
      { id: "health-endpoints", label: "Health endpoints" },
      { id: "yaml-safe", label: "YAML-safe frontmatter" },
    ],
  },
];

export const workflowPosts: WorkflowPost[] = [
  {
    id: "2008027253817712704",
    date: "Jan 5, 2026",
    title: "Planning first prevents slop",
    summary:
      "Emphasizes that most of the human effort is front-loaded into planning so the execution phase stays clean and predictable.",
    tags: ["planning", "quality"],
    stepIds: ["section-0"],
    tone: "planning",
  },
  {
    id: "2008813484348153961",
    date: "Jan 7, 2026",
    title: "What makes a great markdown plan",
    summary:
      "Breaks down how a strong plan document is crafted and why it dominates the overall workflow.",
    tags: ["planning", "process"],
    stepIds: ["section-0"],
    tone: "planning",
  },
  {
    id: "1999969044561375694",
    date: "Dec 13, 2025",
    title: "Idea to plan to multi-model revision",
    summary:
      "Describes the loop of capturing a new idea, producing a plan fast, then refining it with GPT Pro and other models.",
    tags: ["planning", "revisions"],
    stepIds: ["section-0"],
    tone: "planning",
  },
  {
    id: "1999979218378297623",
    date: "Dec 13, 2025",
    title: "Dedicated plan revision pass",
    summary:
      "Highlights the separate plan-rewrite phase to ensure all feedback is integrated before execution starts.",
    tags: ["planning", "quality"],
    stepIds: ["section-0"],
    tone: "planning",
  },
  {
    id: "1939000599242252607",
    date: "Jun 28, 2025",
    title: "Best-practices doc as a contract",
    summary:
      "Shows how a detailed stack guide becomes the shared ruleset the plan and prompts align to.",
    tags: ["architecture", "standards"],
    stepIds: ["section-1"],
    tone: "planning",
  },
  {
    id: "2007194101448573036",
    date: "Jan 2, 2026",
    title: "UI/UX prompt for Next.js 16",
    summary:
      "Documents the UI polish prompt used to push layout, spacing, and motion beyond defaults.",
    tags: ["ux", "prompting"],
    stepIds: ["section-3", "section-5"],
    tone: "ux",
  },
  {
    id: "1984344027576033619",
    date: "Oct 31, 2025",
    title: "Messaging changes agent workflow",
    summary:
      "Explains how agent-to-agent messaging and GPT Pro plan reviews unlocked a new execution cadence.",
    tags: ["coordination", "planning"],
    stepIds: ["section-4"],
    tone: "coordination",
  },
  {
    id: "2006261780218265758",
    date: "Dec 31, 2025",
    title: "Agent Mail + beads + bv stack",
    summary:
      "Argues that Agent Mail plus beads and bv eliminates coordination footguns in multi-agent work.",
    tags: ["coordination", "tools"],
    stepIds: ["section-4"],
    tone: "coordination",
  },
  {
    id: "2006557029964607785",
    date: "Jan 1, 2026",
    title: "Beads accelerate execution",
    summary:
      "Notes that structured task graphs (beads) enable much larger builds at higher speed.",
    tags: ["coordination", "execution"],
    stepIds: ["section-4"],
    tone: "coordination",
  },
  {
    id: "1995863013987868954",
    date: "Dec 2, 2025",
    title: "cass for fast session recall",
    summary:
      "Introduces cass as the search layer that keeps agent history and decisions retrievable.",
    tags: ["tools", "workflow"],
    stepIds: ["section-4"],
    tone: "prompting",
  },
];

/**
 * Convert annotations map to array format for ProcessedTranscript.
 * @returns Array of TranscriptHighlight objects
 */
export function getAnnotations(): TranscriptHighlight[] {
  return Object.entries(annotationsMap).map(([messageId, annotation]) => ({
    messageId,
    ...annotation,
  }));
}

/**
 * Get annotation for a specific message ID.
 * @param messageId - The message ID to look up
 * @returns The annotation if found, or undefined
 */
export function getAnnotationForMessage(
  messageId: string
): Omit<TranscriptHighlight, "messageId"> | undefined {
  return annotationsMap[messageId];
}

/**
 * Check if a message has an annotation.
 * @param messageId - The message ID to check
 * @returns True if the message has an annotation
 */
export function hasAnnotation(messageId: string): boolean {
  return messageId in annotationsMap;
}

/**
 * Get all annotated message IDs.
 * Useful for highlighting annotated messages in the timeline.
 * @returns Set of message IDs that have annotations
 */
export function getAnnotatedMessageIds(): Set<string> {
  return new Set(Object.keys(annotationsMap));
}

/**
 * Get annotations grouped by type.
 * Useful for displaying insights by category.
 * @returns Object with arrays of annotations grouped by type
 */
export function getAnnotationsByType(): Record<
  TranscriptHighlight["type"],
  TranscriptHighlight[]
> {
  const grouped: Record<TranscriptHighlight["type"], TranscriptHighlight[]> = {
    key_decision: [],
    interesting_prompt: [],
    clever_solution: [],
    lesson_learned: [],
  };

  for (const [messageId, annotation] of Object.entries(annotationsMap)) {
    grouped[annotation.type].push({ messageId, ...annotation });
  }

  return grouped;
}
