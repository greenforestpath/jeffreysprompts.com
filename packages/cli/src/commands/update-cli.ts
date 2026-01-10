/**
 * jfp update-cli - Self-update command
 *
 * Downloads and installs the latest version of jfp from GitHub releases.
 * Performs atomic replacement with rollback capability.
 *
 * Usage:
 *   jfp update-cli           # Check for updates and install if available
 *   jfp update-cli --check   # Check for updates without installing
 *   jfp update-cli --force   # Force reinstall even if up to date
 */

import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync, chmodSync } from "fs";
import { dirname, join } from "path";
import { platform, arch, homedir, tmpdir } from "os";
import { spawn } from "child_process";
import chalk from "chalk";
import { version } from "../../package.json";
import { shouldOutputJson } from "../lib/utils";

const GITHUB_REPO = "Dicklesworthstone/jeffreysprompts.com";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

interface UpdateCliOptions {
  json?: boolean;
  check?: boolean;
  force?: boolean;
}

interface ReleaseInfo {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

interface UpdateResult {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  status: "up_to_date" | "update_available" | "updated" | "error";
  message: string;
  downloadUrl?: string;
  error?: string;
}

/**
 * Get the binary name for the current platform
 */
function getBinaryName(): string {
  const os = platform();
  const cpu = arch();

  const platformMap: Record<string, string> = {
    darwin: "macos",
    linux: "linux",
    win32: "windows",
  };

  const archMap: Record<string, string> = {
    x64: "x64",
    arm64: "arm64",
  };

  const osName = platformMap[os];
  const archName = archMap[cpu];

  if (!osName || !archName) {
    throw new Error(`Unsupported platform: ${os}-${cpu}`);
  }

  const ext = os === "win32" ? ".exe" : "";
  return `jfp-${osName}-${archName}${ext}`;
}

/**
 * Fetch the latest release info from GitHub
 */
async function fetchLatestRelease(): Promise<ReleaseInfo> {
  const response = await fetch(GITHUB_API, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "jfp-cli",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch release info: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<ReleaseInfo>;
}

/**
 * Parse version string to comparable numbers
 */
function parseVersion(ver: string): number[] {
  // Remove 'v' prefix if present
  const clean = ver.replace(/^v/, "");
  return clean.split(".").map((n) => parseInt(n, 10) || 0);
}

/**
 * Compare two version strings
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const partsA = parseVersion(a);
  const partsB = parseVersion(b);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;

    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }

  return 0;
}

/**
 * Download a file to a local path
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "jfp-cli",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buffer));
}

/**
 * Compute SHA256 hash of a file
 */
function computeSha256(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Fetch and parse SHA256SUMS.txt from release
 */
async function fetchChecksums(release: ReleaseInfo): Promise<Map<string, string>> {
  const checksumAsset = release.assets.find((a) => a.name === "SHA256SUMS.txt");
  if (!checksumAsset) {
    throw new Error("SHA256SUMS.txt not found in release");
  }

  const response = await fetch(checksumAsset.browser_download_url, {
    headers: { "User-Agent": "jfp-cli" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch checksums: ${response.status}`);
  }

  const text = await response.text();
  const checksums = new Map<string, string>();

  for (const line of text.trim().split("\n")) {
    // Format: "hash  filename" or "hash *filename"
    const match = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/);
    if (match) {
      checksums.set(match[2], match[1]);
    }
  }

  return checksums;
}

/**
 * Get the path to the currently running jfp binary
 */
function getCurrentBinaryPath(): string {
  // process.execPath for compiled binaries, process.argv[0] otherwise
  return process.execPath;
}

/**
 * Verify the new binary actually works
 */
async function verifyBinary(binaryPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(binaryPath, ["--version"], {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 5000,
    });

    let stdout = "";
    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.on("close", (code) => {
      // Should exit 0 and output version
      resolve(code === 0 && stdout.includes("jfp"));
    });

    child.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Main update-cli command
 */
export async function updateCliCommand(options: UpdateCliOptions): Promise<void> {
  const result: UpdateResult = {
    currentVersion: version,
    latestVersion: "",
    updateAvailable: false,
    status: "up_to_date",
    message: "",
  };

  try {
    // Fetch latest release
    const release = await fetchLatestRelease();
    const latestVersion = release.tag_name.replace(/^v/, "");
    result.latestVersion = latestVersion;

    // Check if update is available
    const comparison = compareVersions(version, latestVersion);
    result.updateAvailable = comparison < 0;

    if (!result.updateAvailable && !options.force) {
      result.status = "up_to_date";
      result.message = `Already at latest version (${version})`;

      if (shouldOutputJson(options)) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`✓ ${result.message}`));
      }
      return;
    }

    // If just checking, report and exit
    if (options.check) {
      result.status = "update_available";
      result.message = `Update available: ${version} → ${latestVersion}`;

      if (shouldOutputJson(options)) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.yellow(`⚡ ${result.message}`));
        console.log(chalk.dim(`Run 'jfp update-cli' to install the update`));
      }
      return;
    }

    // Find the binary asset for this platform
    const binaryName = getBinaryName();
    const asset = release.assets.find((a) => a.name === binaryName);

    if (!asset) {
      throw new Error(`No binary found for platform: ${binaryName}`);
    }

    result.downloadUrl = asset.browser_download_url;

    if (!shouldOutputJson(options)) {
      console.log(chalk.cyan(`Updating jfp: ${version} → ${latestVersion}`));
      console.log(chalk.dim(`Downloading ${binaryName}...`));
    }

    // Prepare paths
    const tempDir = join(tmpdir(), `jfp-update-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const tempBinary = join(tempDir, binaryName);
    const currentBinary = getCurrentBinaryPath();
    const backupBinary = `${currentBinary}.bak`;

    try {
      // Download new binary
      await downloadFile(asset.browser_download_url, tempBinary);

      if (!shouldOutputJson(options)) {
        console.log(chalk.dim("Verifying checksum..."));
      }

      // Verify checksum
      const checksums = await fetchChecksums(release);
      const expectedHash = checksums.get(binaryName);

      if (!expectedHash) {
        throw new Error(`No checksum found for ${binaryName}`);
      }

      const actualHash = computeSha256(tempBinary);
      if (actualHash !== expectedHash) {
        throw new Error(`Checksum mismatch: expected ${expectedHash}, got ${actualHash}`);
      }

      // Make binary executable (Unix)
      if (platform() !== "win32") {
        chmodSync(tempBinary, 0o755);
      }

      if (!shouldOutputJson(options)) {
        console.log(chalk.dim("Verifying binary..."));
      }

      // Verify the binary actually runs
      const binaryWorks = await verifyBinary(tempBinary);
      if (!binaryWorks) {
        throw new Error("Downloaded binary failed verification");
      }

      // Atomic replace with backup
      if (!shouldOutputJson(options)) {
        console.log(chalk.dim("Installing..."));
      }

      // Create backup
      if (existsSync(currentBinary)) {
        // Remove old backup if exists
        if (existsSync(backupBinary)) {
          unlinkSync(backupBinary);
        }
        renameSync(currentBinary, backupBinary);
      }

      // Install new binary
      try {
        renameSync(tempBinary, currentBinary);
      } catch (installError) {
        // Cross-device link error - copy instead
        const newContent = readFileSync(tempBinary);
        writeFileSync(currentBinary, newContent);
        if (platform() !== "win32") {
          chmodSync(currentBinary, 0o755);
        }
      }

      // Final verification
      const finalCheck = await verifyBinary(currentBinary);
      if (!finalCheck) {
        // Rollback
        if (existsSync(backupBinary)) {
          renameSync(backupBinary, currentBinary);
        }
        throw new Error("Installed binary failed verification, rolled back");
      }

      // Cleanup
      try {
        if (existsSync(tempBinary)) unlinkSync(tempBinary);
        if (existsSync(tempDir)) {
          const { rmdirSync } = await import("fs");
          rmdirSync(tempDir);
        }
      } catch {
        // Cleanup failure is not critical
      }

      result.status = "updated";
      result.message = `Successfully updated to ${latestVersion}`;

      if (shouldOutputJson(options)) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.green(`✓ ${result.message}`));
        if (existsSync(backupBinary)) {
          console.log(chalk.dim(`Backup saved to: ${backupBinary}`));
        }
      }
    } catch (updateError) {
      // Cleanup temp files
      try {
        if (existsSync(tempBinary)) unlinkSync(tempBinary);
        if (existsSync(tempDir)) {
          const { rmdirSync } = await import("fs");
          rmdirSync(tempDir);
        }
      } catch {
        // Ignore cleanup errors
      }
      throw updateError;
    }
  } catch (error) {
    result.status = "error";
    result.error = error instanceof Error ? error.message : String(error);
    result.message = `Update failed: ${result.error}`;

    if (shouldOutputJson(options)) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(chalk.red(`✗ ${result.message}`));
    }
    process.exit(1);
  }
}
