/**
 * Tests for copy command
 *
 * Tests prompt lookup, rendering, and clipboard fallback behavior.
 * In test environments without clipboard tools, the command falls back
 * to outputting the rendered content to stdout.
 *
 * NOTE: In non-TTY environments (tests, CI, pipes), shouldOutputJson()
 * returns true, so all output is JSON format.
 *
 * Includes real clipboard tests that:
 * - Verify actual clipboard round-trip (copy + paste)
 * - Are skipped in CI environments where clipboard isn't available
 */
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { spawn, spawnSync } from "child_process";
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

/**
 * Real Clipboard Tests
 *
 * These tests verify actual clipboard operations by:
 * 1. Copying content to clipboard via the copy command
 * 2. Reading content back from clipboard using platform tools
 * 3. Verifying the round-trip worked correctly
 *
 * These tests are skipped in CI environments where clipboard tools
 * are not available (no X11/Wayland display server).
 */
describe("copyCommand - Real Clipboard Tests", () => {
  // Detect if we're in a CI environment or clipboard is unavailable
  const isCI = process.env.CI === "true" || process.env.CI === "1";
  const platform = process.platform;

  // Check if clipboard tools are available
  function hasClipboardTool(): boolean {
    if (platform === "darwin") {
      return spawnSync("which", ["pbcopy"]).status === 0;
    } else if (platform === "win32") {
      return true; // clip.exe is always available on Windows
    } else {
      // Linux: check for wl-paste or xclip
      const hasWlPaste = spawnSync("which", ["wl-paste"]).status === 0;
      const hasXclip = spawnSync("which", ["xclip"]).status === 0;
      // Also need a display server
      const hasDisplay = !!(process.env.WAYLAND_DISPLAY || process.env.DISPLAY);
      return (hasWlPaste || hasXclip) && hasDisplay;
    }
  }

  // Read from clipboard
  async function readClipboard(): Promise<string | null> {
    return new Promise((resolve) => {
      let cmd: string;
      let args: string[] = [];

      if (platform === "darwin") {
        cmd = "pbpaste";
      } else if (platform === "win32") {
        cmd = "powershell";
        args = ["-command", "Get-Clipboard"];
      } else {
        // Linux: prefer wl-paste, fall back to xclip
        const hasWlPaste = spawnSync("which", ["wl-paste"]).status === 0;
        if (hasWlPaste) {
          cmd = "wl-paste";
        } else {
          cmd = "xclip";
          args = ["-selection", "clipboard", "-o"];
        }
      }

      const proc = spawn(cmd, args);
      let output = "";

      proc.stdout.on("data", (data) => {
        output += data.toString();
      });

      proc.on("error", () => resolve(null));
      proc.on("close", (code) => {
        resolve(code === 0 ? output : null);
      });
    });
  }

  // Skip all tests if in CI or no clipboard available
  const shouldSkip = isCI || !hasClipboardTool();
  const itOrSkip = shouldSkip ? it.skip : it;

  if (shouldSkip) {
    it("skipped - no clipboard available in this environment", () => {
      console.log("Real clipboard tests skipped:", {
        isCI,
        hasClipboardTool: hasClipboardTool(),
        platform,
        DISPLAY: process.env.DISPLAY,
        WAYLAND_DISPLAY: process.env.WAYLAND_DISPLAY,
      });
      expect(true).toBe(true);
    });
  }

  itOrSkip("copies prompt to real clipboard and verifies content", async () => {
    // Clear previous console captures for this test
    output = [];
    errors = [];
    exitCode = undefined;

    // Copy the prompt
    try {
      await copyCommand("idea-wizard", { json: true });
    } catch {
      // May exit
    }

    const allOutput = output.join("\n");
    const parsed = JSON.parse(allOutput);

    // Should have succeeded
    expect(parsed.success).toBe(true);
    expect(parsed.id).toBe("idea-wizard");

    // Read back from clipboard
    const clipboardContent = await readClipboard();
    expect(clipboardContent).not.toBeNull();
    expect(clipboardContent).toContain("Come up with your very best ideas");
  });

  itOrSkip("clipboard contains full rendered prompt", async () => {
    output = [];
    errors = [];
    exitCode = undefined;

    try {
      await copyCommand("idea-wizard", { json: true });
    } catch {
      // May exit
    }

    const clipboardContent = await readClipboard();
    expect(clipboardContent).not.toBeNull();

    // Verify multiple key phrases from the prompt
    expect(clipboardContent).toContain("30 ideas");
    expect(clipboardContent).toContain("ultrathink");
  });

  itOrSkip("clipboard content length matches reported characters", async () => {
    output = [];
    errors = [];
    exitCode = undefined;

    try {
      await copyCommand("idea-wizard", { json: true });
    } catch {
      // May exit
    }

    const allOutput = output.join("\n");
    const parsed = JSON.parse(allOutput);

    if (parsed.success) {
      const clipboardContent = await readClipboard();
      expect(clipboardContent).not.toBeNull();
      // Content length should match (trim to handle trailing newlines)
      expect(clipboardContent!.trim().length).toBe(parsed.characters);
    }
  });
});
