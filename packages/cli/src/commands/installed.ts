import { join, resolve } from "path";
import Table from "cli-table3";
import { getHomeDir } from "../lib/config";
import chalk from "chalk";
import { readManifest } from "../lib/manifest";
import { shouldOutputJson } from "../lib/utils";

interface InstalledOptions {
  project?: boolean;
  personal?: boolean;
  json?: boolean;
}

export function installedCommand(options: InstalledOptions) {
  const personalDir = join(getHomeDir(), ".config/claude/skills");
  const projectDir = resolve(process.cwd(), ".claude/skills");

  // Determine which locations to check
  const checkPersonal = options.personal || (!options.project && !options.personal);
  const checkProject = options.project || (!options.project && !options.personal);

  const results: Array<{
    id: string;
    kind: string;
    version: string;
    location: "personal" | "project";
  }> = [];

  // Gather installed skills from requested locations
  if (checkPersonal) {
    const personalManifest = readManifest(personalDir);
    if (personalManifest) {
      for (const entry of personalManifest.entries) {
        results.push({
          id: entry.id,
          kind: entry.kind,
          version: entry.version,
          location: "personal",
        });
      }
    }
  }

  if (checkProject) {
    const projectManifest = readManifest(projectDir);
    if (projectManifest) {
      for (const entry of projectManifest.entries) {
        results.push({
          id: entry.id,
          kind: entry.kind,
          version: entry.version,
          location: "project",
        });
      }
    }
  }

  // JSON output
  if (shouldOutputJson(options)) {
    console.log(
      JSON.stringify(
        {
          installed: results,
          count: results.length,
          locations: {
            personal: checkPersonal ? personalDir : null,
            project: checkProject ? projectDir : null,
          },
        },
        null,
        2
      )
    );
    return;
  }

  // Human-readable output
  if (results.length === 0) {
    console.log(chalk.dim("No JFP skills installed."));
    console.log(
      chalk.dim("\nInstall skills with: " + chalk.cyan("jfp install <id>"))
    );
    return;
  }

  const table = new Table({
    head: ["ID", "Kind", "Version", "Location"],
    style: { head: ["cyan"] },
  });

  for (const skill of results) {
    const locationBadge =
      skill.location === "personal"
        ? chalk.blue("personal")
        : chalk.green("project");

    table.push([skill.id, skill.kind, skill.version, locationBadge]);
  }

  console.log(table.toString());
  console.log(
    chalk.dim("\n" + results.length + " skill" + (results.length !== 1 ? "s" : "") + " installed")
  );

  // Show paths
  if (checkPersonal) {
    console.log(chalk.dim("Personal: " + personalDir));
  }
  if (checkProject) {
    console.log(chalk.dim("Project:  " + projectDir));
  }
}
