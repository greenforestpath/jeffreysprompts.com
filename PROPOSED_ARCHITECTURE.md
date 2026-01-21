# PROPOSED_ARCHITECTURE.md

## Overview
Port `jfp` to an idiomatic Rust workspace while preserving CLI behavior and output formats. Use SQLite as the primary store with JSONL exports for human/Git workflows. Leverage existing /dp libraries for MCP, SQLite modeling, and rich terminal output.

## Workspace Layout (proposed)
```
crates/
  jfp/
    Cargo.toml
    src/
      main.rs
      cli/
      commands/
      config/
      auth/
      registry/
      storage/
      offline/
      search/
      export/
      mcp/
      ui/
```

## Local Library Leverage (explicit)
- `/dp/fastmcp_rust`:
  - Use `fastmcp-server` + `fastmcp-protocol` for `jfp serve` MCP implementation.
- `/dp/sqlmodel_rust`:
  - Use `sqlmodel-sqlite` for schema modeling and migrations instead of raw SQL.
- `/dp/rich_rust`:
  - Use `rich_rust` for table, box, and colorized output instead of ad-hoc ANSI.
- `/dp/beads_rust`:
  - Mirror sync + JSONL patterns (atomic writes, hashing, lock discipline).

## Optional / Deferred Libraries
- `/dp/charmed_rust`: consider for richer `jfp i` TUI later; not required for parity.
- `/dp/asupersync`, `/dp/fastapi_rust`, `/dp/opentui_rust`: not planned for this CLI port.

## Core Dependencies (beyond /dp)
- CLI: `clap` (derive), `clap_complete`.
- Serialization: `serde`, `serde_json`, `serde_yaml`.
- HTTP: `reqwest` (async) or `ureq` (sync) consistent with chosen runtime.
- SQLite: `sqlmodel-sqlite` (via /dp/sqlmodel_rust) + `rusqlite` under the hood.
- Locking: `fs4` for cross-process locks.
- Hashing: `sha2`, `hex`.
- Time: `chrono` or `time`.
- Temp files: `tempfile`.

## Storage Design
SQLite (primary):
- `registry_prompts` (public + cached)
- `registry_bundles`
- `registry_workflows`
- `saved_prompts`
- `notes`
- `collections`
- `collection_prompts`
- `sync_meta` (schema_version, last_synced_at, source_of_truth, jsonl_sha256, record_count)

JSONL (backup/export):
- `~/.config/jfp/library/library.jsonl`
- `~/.config/jfp/library/library.meta.json`

## Sync + Recovery
- One-way sync: SQLite -> JSONL by default.
- Lock file: `~/.config/jfp/locks/sync.lock`.
- Atomic JSONL write via temp file + fsync + rename.
- Recovery commands:
  - `jfp export-jsonl`
  - `jfp import-jsonl`
  - `jfp db check`

## CLI Behavior Targets
- Preserve JSON output shapes and error codes from `EXISTING_JFP_STRUCTURE.md`.
- Preserve TTY formatting semantics (tables, boxes, highlights).
- Preserve auto-JSON behavior when stdout is not a TTY.

## MCP Server (jfp serve)
- Expose `prompt://<id>` resources.
- Tools:
  - `search_prompts` (query/category/tags/limit)
  - `render_prompt` (id, variables, context)
- Use `fastmcp_rust` for protocol + stdio transport.

## Notes on Rust Toolchain
- Edition 2024.
- Latest nightly as per porting skill guidance.
