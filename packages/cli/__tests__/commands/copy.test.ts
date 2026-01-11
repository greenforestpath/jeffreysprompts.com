/**
 * Tests for copy command
 *
 * Tests prompt lookup, rendering, and clipboard fallback behavior.
 * In test environments without clipboard tools, the command falls back
 * to outputting the rendered content to stdout.
 *
 * NOTE: In non-TTY environments (tests, CI, pipes), shouldOutputJson()
 * returns true, so all output is JSON format.
 */
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { copyCommand } from "../../src/commands/copy";

let output: string[] = [];
let errors: string[] = [];
let exitCode: number | undefined;

const originalLog = console.log;
const originalError = console.error;
const originalExit = process.exit;
const originalArgv = process.argv;

beforeEach(() => {
  output = [];
  errors = [];
  exitCode = undefined;
  console.log = (...args: unknown[]) => {
    output.push(args.join(" "));
  };
  console.error = (...args: unknown[]) => {
    errors.push(args.join(" "));
  };
  process.exit = ((code?: number) => {
    exitCode = code ?? 0;
    throw new Error("process.exit");
  }) as never;
  process.argv = ["node", "jfp", "copy", "idea-wizard"];
});

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
  process.exit = originalExit;
  process.argv = originalArgv;
});

describe("copyCommand", () => {
  it("handles non-existent prompt with JSON output", async () => {
    await expect(copyCommand("nonexistent-prompt", { json: true })).rejects.toThrow();
    const allOutput = output.join("\n");
    expect(allOutput).toContain("not_found");
    expect(exitCode).toBe(1);
  });

  it("handles non-existent prompt in non-TTY mode", async () => {
    // In non-TTY mode, shouldOutputJson() returns true, so output is JSON
    await expect(copyCommand("nonexistent-prompt", {})).rejects.toThrow();
    const allOutput = output.join("\n");
    // JSON error output goes to stdout
    expect(allOutput).toContain("not_found");
    expect(exitCode).toBe(1);
  });

  it("processes a valid prompt with JSON output", async () => {
    // When clipboard is not available, command outputs fallback with content
    try {
      await copyCommand("idea-wizard", { json: true });
    } catch {
      // May throw on clipboard failure (exit 1)
    }

    const allOutput = output.join("\n");

    // Parse JSON output
    const parsed = JSON.parse(allOutput);

    // Either success (clipboard worked) or clipboard_failed (no tool)
    if (parsed.success === true) {
      expect(parsed.id).toBe("idea-wizard");
      expect(parsed.message).toContain("Copied");
    } else if (parsed.error === "clipboard_failed") {
      // Fallback contains the rendered prompt content
      expect(parsed.fallback).toContain("Come up with your very best ideas");
      // Clipboard failure exits with code 1
      expect(exitCode).toBe(1);
    }
  });

  it("handles valid prompt in non-TTY mode", async () => {
    // In non-TTY mode, shouldOutputJson() returns true, so output is JSON
    try {
      await copyCommand("idea-wizard", {});
    } catch {
      // May exit if clipboard not available
    }

    const allOutput = output.join("\n");

    // Parse JSON output
    const parsed = JSON.parse(allOutput);

    // Either success (clipboard worked) or clipboard_failed (no tool)
    if (parsed.success === true) {
      expect(parsed.id).toBe("idea-wizard");
      expect(parsed.characters).toBeGreaterThan(0);
    } else if (parsed.error === "clipboard_failed") {
      // Fallback contains the rendered prompt content
      expect(parsed.fallback).toContain("Come up with your very best ideas");
    }
  });
});
