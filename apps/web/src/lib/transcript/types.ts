/**
 * Transcript type definitions for the "How It Was Made" page.
 * These types structure the Claude Code session transcript for display.
 */

/**
 * A single message in the transcript.
 */
export interface TranscriptMessage {
  id: string;
  type: "user" | "assistant" | "tool_use" | "tool_result" | "system";
  timestamp: string;
  content: string;
  toolCalls?: ToolCall[];
  thinking?: string;
  model?: string;
}

/**
 * A tool call made by Claude during the session.
 */
export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output: string;
  duration?: number;
  success: boolean;
}

/**
 * A section of the transcript (e.g., "Planning", "Implementation").
 */
export interface TranscriptSection {
  id: string;
  title: string;
  summary: string;
  startIndex: number;
  endIndex: number;
  tags: string[];
}

/**
 * The fully processed transcript with metadata.
 */
export interface ProcessedTranscript {
  meta: {
    sessionId: string;
    startTime: string;
    endTime: string;
    duration: string;
    model: string;
    stats: TranscriptStats;
  };
  sections: TranscriptSection[];
  messages: TranscriptMessage[];
  highlights: TranscriptHighlight[];
}

/**
 * Statistics about the session.
 */
export interface TranscriptStats {
  userMessages: number;
  assistantMessages: number;
  toolCalls: number;
  filesEdited: number;
  linesWritten: number;
  tokensUsed: number;
}

/**
 * A highlighted moment in the transcript.
 */
export interface TranscriptHighlight {
  messageId: string;
  type: "key_decision" | "interesting_prompt" | "clever_solution" | "lesson_learned";
  annotation: string;
}
