"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  Brain,
  Terminal,
  User,
  Bot,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { type TranscriptMessage, type ToolCall } from "@/lib/transcript/types";
import { detectLanguage, formatTime } from "@/lib/transcript/utils";
import { CopyButton } from "@/components/ui/copy-button";
import { MessageContent } from "./message-content";

interface MessageDetailProps {
  message: TranscriptMessage;
  highlight?: {
    type: string;
    annotation: string;
  };
}

const toolIcons: Record<string, typeof Code> = {
  Read: FileText,
  Write: FileText,
  Edit: FileText,
  Bash: Terminal,
  Glob: FileText,
  Grep: Code,
  Task: Wrench,
  WebFetch: Code,
  WebSearch: Code,
};

function getToolIcon(toolName: string) {
  return toolIcons[toolName] || Wrench;
}

function getMessageIcon(type: TranscriptMessage["type"]) {
  switch (type) {
    case "user":
      return User;
    case "assistant":
      return Bot;
    case "tool_use":
    case "tool_result":
      return Wrench;
    default:
      return AlertCircle;
  }
}

function getMessageLabel(type: TranscriptMessage["type"]) {
  switch (type) {
    case "user":
      return "Human";
    case "assistant":
      return "Claude";
    case "tool_use":
      return "Tool Call";
    case "tool_result":
      return "Tool Result";
    case "system":
      return "System";
  }
}

export function MessageDetail({ message, highlight }: MessageDetailProps) {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [showThinking, setShowThinking] = useState(false);

  const toggleTool = (toolId: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  const Icon = getMessageIcon(message.type);
  const isUser = message.type === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group rounded-xl border p-4",
        isUser
          ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800"
          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isUser
              ? "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
            {getMessageLabel(message.type)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatTime(message.timestamp)}
            {message.model && (
              <span className="ml-2 text-zinc-400 dark:text-zinc-500">
                {message.model}
              </span>
            )}
          </div>
        </div>
        <CopyButton text={message.content} className="opacity-0 group-hover:opacity-100" />
      </div>

      {/* Highlight annotation */}
      {highlight && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">
              {highlight.type.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
            {highlight.annotation}
          </p>
        </div>
      )}

      {/* Extended thinking toggle */}
      {message.thinking && (
        <div className="mb-3">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className={cn(
              "flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              "text-zinc-600 dark:text-zinc-400"
            )}
          >
            {showThinking ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Brain className="w-4 h-4 text-purple-500" />
            <span>Extended Thinking</span>
          </button>

          <AnimatePresence>
            {showThinking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-800 dark:text-purple-300 whitespace-pre-wrap">
                    {message.thinking}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Message content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <MessageContent content={message.content} />
      </div>

      {/* Tool calls */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Tool Calls ({message.toolCalls.length})
          </div>

          {message.toolCalls.map((tool) => (
            <ToolCallDisplay
              key={tool.id}
              tool={tool}
              expanded={expandedTools.has(tool.id)}
              onToggle={() => toggleTool(tool.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface ToolCallDisplayProps {
  tool: ToolCall;
  expanded: boolean;
  onToggle: () => void;
}

function ToolCallDisplay({ tool, expanded, onToggle }: ToolCallDisplayProps) {
  const Icon = getToolIcon(tool.name);
  const inputJson = JSON.stringify(tool.input, null, 2);
  const outputLanguage = detectLanguage(tool.output);

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        tool.success
          ? "border-zinc-200 dark:border-zinc-700"
          : "border-red-200 dark:border-red-800"
      )}
    >
      {/* Tool header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-left",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors",
          !tool.success && "bg-red-50/50 dark:bg-red-950/20"
        )}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        )}
        <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        <span className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
          {tool.name}
        </span>
        {tool.duration && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
            {tool.duration}ms
          </span>
        )}
        {!tool.success && (
          <span className="text-xs text-red-600 dark:text-red-400 ml-2">
            Failed
          </span>
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-200 dark:border-zinc-700">
              {/* Input */}
              <div className="border-b border-zinc-200 dark:border-zinc-700">
                <div className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50">
                  Input
                </div>
                <div className="max-h-64 overflow-auto">
                  <SyntaxHighlighter
                    language="json"
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: "0.75rem",
                    }}
                  >
                    {inputJson}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50">
                  Output
                </div>
                <div className="max-h-64 overflow-auto">
                  {tool.output.length > 0 ? (
                    <SyntaxHighlighter
                      language={outputLanguage}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        fontSize: "0.75rem",
                      }}
                    >
                      {tool.output}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 italic">
                      No output
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
