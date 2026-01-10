/**
 * TestLogger - Structured logging for E2E tests
 *
 * Features:
 * - Log levels: debug, info, step, error
 * - Timestamps with millisecond precision
 * - Context tagging for filtering
 * - File output for CI artifact collection
 * - JSON and human-readable formats
 */

import { writeFileSync, appendFileSync, mkdirSync } from "fs";
import { dirname } from "path";

export type LogLevel = "debug" | "info" | "step" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  durationMs?: number;
}

export interface TestLoggerOptions {
  /** Test name for context */
  testName: string;
  /** Minimum log level to output (default: "info") */
  minLevel?: LogLevel;
  /** Output file path for CI artifacts (optional) */
  outputFile?: string;
  /** Output format: "json" or "text" (default: "text") */
  format?: "json" | "text";
  /** Enable console output (default: true) */
  consoleOutput?: boolean;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  step: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m", // gray
  info: "\x1b[36m", // cyan
  step: "\x1b[32m", // green
  error: "\x1b[31m", // red
};

const RESET = "\x1b[0m";

/**
 * TestLogger provides structured logging for E2E tests with multiple outputs.
 *
 * @example
 * ```ts
 * const logger = new TestLogger({
 *   testName: "homepage-load",
 *   outputFile: "./test-logs/homepage.log",
 * });
 *
 * logger.step("Loading homepage");
 * logger.info("Page title retrieved", { title: document.title });
 * logger.debug("Full HTML", { html: document.body.innerHTML });
 * ```
 */
export class TestLogger {
  private testName: string;
  private minLevel: LogLevel;
  private outputFile?: string;
  private format: "json" | "text";
  private consoleOutput: boolean;
  private entries: LogEntry[] = [];
  private stepCounter = 0;
  private startTime: number;

  constructor(options: TestLoggerOptions) {
    this.testName = options.testName;
    this.minLevel = options.minLevel ?? "info";
    this.outputFile = options.outputFile;
    this.format = options.format ?? "text";
    this.consoleOutput = options.consoleOutput ?? true;
    this.startTime = Date.now();

    // Create output directory if needed
    if (this.outputFile) {
      mkdirSync(dirname(this.outputFile), { recursive: true });
      // Write header
      if (this.format === "text") {
        writeFileSync(
          this.outputFile,
          `=== Test: ${this.testName} ===\n` +
            `Started: ${new Date().toISOString()}\n` +
            `${"=".repeat(50)}\n\n`
        );
      } else {
        writeFileSync(this.outputFile, "");
      }
    }
  }

  /**
   * Log a debug message (lowest priority, for verbose output)
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Log an informational message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Log a test step (numbered automatically)
   */
  step(message: string, data?: Record<string, unknown>): void {
    this.stepCounter++;
    this.log("step", `[Step ${this.stepCounter}] ${message}`, data);
  }

  /**
   * Log an error
   */
  error(message: string, data?: Record<string, unknown>): void {
    this.log("error", message, data);
  }

  /**
   * Start a timed operation. Returns a function to call when done.
   */
  startTimer(operation: string): () => void {
    const start = Date.now();
    this.debug(`Starting: ${operation}`);

    return () => {
      const duration = Date.now() - start;
      this.info(`Completed: ${operation}`, { durationMs: duration });
    };
  }

  /**
   * Log with a specific level
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.testName,
      data,
      durationMs: Date.now() - this.startTime,
    };

    this.entries.push(entry);

    // Console output
    if (this.consoleOutput) {
      this.writeConsole(entry);
    }

    // File output
    if (this.outputFile) {
      this.writeFile(entry);
    }
  }

  /**
   * Write entry to console with colors
   */
  private writeConsole(entry: LogEntry): void {
    const color = LEVEL_COLORS[entry.level];
    const levelTag = entry.level.toUpperCase().padEnd(5);
    const elapsed = `+${entry.durationMs}ms`.padStart(8);

    let line = `${color}${levelTag}${RESET} ${elapsed} [${entry.context}] ${entry.message}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      const dataStr = JSON.stringify(entry.data);
      // Truncate long data
      line += ` ${dataStr.length > 100 ? dataStr.slice(0, 100) + "..." : dataStr}`;
    }

    console.log(line);
  }

  /**
   * Write entry to file
   */
  private writeFile(entry: LogEntry): void {
    if (!this.outputFile) return;

    if (this.format === "json") {
      appendFileSync(this.outputFile, JSON.stringify(entry) + "\n");
    } else {
      const levelTag = entry.level.toUpperCase().padEnd(5);
      const elapsed = `+${entry.durationMs}ms`.padStart(8);
      let line = `${entry.timestamp} ${levelTag} ${elapsed} ${entry.message}`;

      if (entry.data && Object.keys(entry.data).length > 0) {
        line += `\n  Data: ${JSON.stringify(entry.data, null, 2).replace(/\n/g, "\n  ")}`;
      }

      appendFileSync(this.outputFile, line + "\n");
    }
  }

  /**
   * Get all logged entries (for assertions)
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries filtered by level
   */
  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  /**
   * Check if any errors were logged
   */
  hasErrors(): boolean {
    return this.entries.some((e) => e.level === "error");
  }

  /**
   * Get total duration since logger creation
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Write a summary at the end of the test
   */
  summary(): void {
    const duration = this.getDuration();
    const errorCount = this.getEntriesByLevel("error").length;
    const stepCount = this.stepCounter;

    const summaryLine =
      `\n=== Summary: ${this.testName} ===\n` +
      `Duration: ${duration}ms\n` +
      `Steps: ${stepCount}\n` +
      `Errors: ${errorCount}\n` +
      `Status: ${errorCount === 0 ? "PASSED" : "FAILED"}\n`;

    if (this.consoleOutput) {
      console.log(summaryLine);
    }

    if (this.outputFile) {
      appendFileSync(this.outputFile, summaryLine);
    }
  }
}
