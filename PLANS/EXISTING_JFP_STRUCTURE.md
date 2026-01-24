# EXISTING_JFP_STRUCTURE.md

> Spec extracted from current Bun/TypeScript CLI (jfp.ts, packages/cli). This document is the source of truth for Rust parity. Do not reinterpret behavior during implementation.

## 1) Entry Points and CLI Framework
- Entry: `jfp.ts` -> calls `checkForUpdatesInBackground()` then `cli.parse()` from `packages/cli/src/index.ts`.
- CLI framework: `cac`.
- Global flag: `--no-color` is handled BEFORE chalk import. If `--no-color` OR `NO_COLOR` OR `JFP_NO_COLOR` is set, it sets `process.env.NO_COLOR = "1"`.
- Default command (no args) prints `cli.outputHelp()`.

## 2) Global Output Rules and Exit Codes
- JSON output rule: `shouldOutputJson(options)` returns true if `options.json === true` OR `!process.stdout.isTTY`.
- Color disable: `--no-color`, `NO_COLOR`, or `JFP_NO_COLOR`.
- Skill ID safety regex (`isSafeSkillId`): `^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$` (used by install/uninstall).
- Path traversal guard: `resolveSafeChildPath(root, child)` throws `Unsafe path: <child>` if child escapes root.
- Exit codes observed:
  - `1` for most errors
  - `2` for invalid skill IDs in `uninstall`
  - `130` for user-cancel (Ctrl+C) in interactive variable fill
- Error payload patterns are per-command (no single global schema). Some commands have stable shapes (notably `show` not_found).

## 3) Config System
File: `packages/cli/src/lib/config.ts`

### Paths
- Home override: `JFP_HOME` replaces `homedir()`.
- Config dir: `${JFP_HOME or HOME}/.config/jfp`.
- Config file: `${configDir}/config.json`.

### Defaults (createDefaultConfig)
```
registry:
  url: https://jeffreysprompts.com/api/prompts
  remote: https://jeffreysprompts.com/api/prompts
  manifestUrl: https://jeffreysprompts.com/registry.manifest.json
  cachePath: ~/.config/jfp/registry.json
  metaPath: ~/.config/jfp/registry.meta.json
  autoRefresh: true
  cacheTtl: 3600
  timeoutMs: 2000
updates:
  autoCheck: true
  autoUpdate: false
  channel: stable
  lastCheck: null
  latestKnownVersion: null
skills:
  personalDir: ~/.config/claude/skills
  projectDir: .claude/skills
  preferProject: false
output:
  color: true
  json: false
localPrompts:
  enabled: true
  dir: ~/.config/jfp/local
analytics:
  enabled: false
```

### Env Overrides
- `JFP_REGISTRY_URL` overrides `registry.url` and `registry.remote`.
- `JFP_CACHE_TTL` overrides `registry.cacheTtl` (int).
- `JFP_NO_COLOR` disables `output.color`.

### Save Behavior
- `saveConfig` merges into stored config and writes atomically via temp file + rename.

### Config Commands (packages/cli/src/commands/config.ts)
- `config list`: prints full config; JSON uses `loadConfig()`.
- `config get <key>`: dot notation lookup; error `not_found` if missing.
- `config set <key> <value>`:
  - Validates key exists in defaults.
  - Parses value type based on default type (string/number/boolean).
  - Unknown key => error `invalid_key`.
- `config reset`: overwrites with defaults.
- `config path`: prints config file path.

## 4) Credentials and Auth
File: `packages/cli/src/lib/credentials.ts`

### Credentials Schema
```
access_token: string
refresh_token?: string
expires_at: string (ISO 8601)
email: string (email)
tier: "free" | "premium"
user_id: string
```

### Storage
- Path: `${XDG_CONFIG_HOME|HOME}/jfp/credentials.json`.
- Directory perms: `0700` (mkdir with mode).
- File perms: `0600` (writeFile with mode).
- Atomic write via temp file + rename.
- `loadCredentials` validates via Zod; invalid/corrupt file => returns `null` and continues.

### Expiry and Refresh
- Expiry check uses 5-minute buffer.
- Refresh endpoint: `${JFP_PREMIUM_URL || https://pro.jeffreysprompts.com}/api/cli/token/refresh`.
- Refresh body: `{ refresh_token, client_id: "jfp-cli" }`.
- If refresh succeeds, saves new credentials.

### Env Override
- `JFP_TOKEN` bypasses credentials file and supplies token directly (no user info).
- `JFP_DEBUG` enables debug logs to stderr.

## 5) API Client
File: `packages/cli/src/lib/api-client.ts`

- Base URL: `JFP_PREMIUM_API_URL` or `https://pro.jeffreysprompts.com/api`.
- Timeout: 30s (abort controller).
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>` if token.
- JSON parsing only when `Content-Type` includes `application/json`.
- Error message extraction: use `error` or `message` string fields from JSON, else `statusText`.
- ApiResponse shape: `{ ok, status, data?, error? }`.
- Helpers: `isAuthError` (401), `isPermissionError` (403), `isNotFoundError` (404), `requiresPremium` (403 + error contains "premium").

## 6) Registry Loader (SWR)
File: `packages/cli/src/lib/registry-loader.ts`

### Cache
- `registry.json` and `registry.meta.json` with `RegistryMeta`:
  - `version`, `etag`, `fetchedAt`, `promptCount`.
- Uses ETag with `If-None-Match`.
- Cache TTL in seconds from config.

### Sources and Merge Order
- Local prompts (`~/.config/jfp/local/*.json`) if enabled.
- Offline prompts from `~/.config/jfp/library/prompts.json` (saved prompts).
- Cache/remote/bundled prompts from `@jeffreysprompts/core/prompts`.
- Merge order: offline -> cached/remote/bundled -> local (later wins by id).

### Local Prompts Validation
- Accepts JSON file with single prompt or array of prompts.
- Validates with `PromptSchema`.
- Warns if invalid but has `id` key.

### SWR Behavior
- If cache exists and stale and `autoRefresh`, triggers background refresh.
- If no cache, tries remote fetch; if fails, falls back to bundled prompts.

## 7) Offline Library (JSON Cache)
File: `packages/cli/src/lib/offline.ts`

### Paths
- Library dir: `~/.config/jfp/library`.
- Prompts file: `prompts.json`.
- Meta file: `sync.meta.json`.

### Types
```
SyncedPrompt: { id, title, content, description?, category?, tags?, saved_at }
SyncMeta: { lastSync, promptCount, version }
```

### Online Check
- HEAD to `https://jeffreysprompts.com/api/health`, timeout 3000ms.
- Offline check cached for 10s.

### Offline Search Scoring
- Title contains: +10 (prefix +5)
- ID contains: +8
- Description contains: +5
- Category contains: +3
- Tag contains: +2
- Content contains: +1

## 8) Skills Manifest
File: `packages/cli/src/lib/manifest.ts`

- Manifest: `manifest.json` in skills dir.
- `FullSkillManifest`: `{ generatedAt, jfpVersion, entries[] }`.
- Entry fields: `{ id, kind, version, hash, updatedAt }`.
- JFP-generated detection: `x_jfp_generated: true` in YAML frontmatter.
- Hash: `computeSkillHash` from `@jeffreysprompts/core/export`.
- `checkSkillModification`:
  - `canOverwrite` true if file does not exist OR (generated AND not modified).
  - If manifest entry missing but file exists, treated as modified.

## 9) Variable Handling
File: `packages/cli/src/lib/variables.ts`

- CLI variable flags: `--VAR=value` must match regex `^--([a-zA-Z][a-zA-Z0-9_]*)=(.*)$`.
- Max file var size: `MAX_FILE_VAR_SIZE = 102400` bytes (100KB).
- File variable max size: 100KB; if larger, read first 100KB and append truncation notice.
- Truncation message suffix: `"[File truncated to 102400 bytes from <SIZE> bytes]"`.
- Prompting uses `@inquirer/prompts` for select, multiline, file, path, text.
- For `file` type: reads file content. For `path` type: passes raw value.
- Dynamic defaults from `getDynamicDefaults(process.cwd())` (CWD, PROJECT_NAME).

## 10) Commands and Behavior

### list
- Options: `--category`, `--tag`, `--mine`, `--saved`, `--json`.
- If `--mine` or `--saved` and not logged in -> `not_authenticated` error, exit 1.
- If logged in:
  - With `--mine` and/or `--saved`, calls:
    - `GET /cli/prompts/mine` and/or `GET /cli/prompts/saved`.
  - Without these flags, tries `GET /cli/prompts/mine` with allowFailure and merges into public prompts.
- Offline fallback: if network error and offline library exists, uses offline saved prompts and sets `offline` output.
- JSON output: `{ prompts, count, offline?, offlineAge? }`.

### search
- Options: `--limit` (default 10), `--mine`, `--saved`, `--all`, `--local`, `--json`.
- Invalid `--limit` -> `invalid_limit` error, exit 1.
- If `--mine/--saved/--all` and not logged in -> `not_authenticated` error, exit 1.
- If logged in but not premium and `--mine/--saved/--all` -> `premium_required` error, exit 1.
- Local search uses BM25 index from core (`buildIndex`, `searchPrompts`).
- Personal search:
  - Endpoint: `/cli/search/mine` (mine only), `/cli/search/saved` (saved only), otherwise `/cli/search`.
  - If 401 -> `auth_expired`.
  - On network error and offline library exists -> offline search (saved prompts).
  - NOTE: code calls `response.json()` on ApiResponse; as written this will throw (bug).
- Merge: personal results + local results, dedupe by id, sort by score desc, limit.
- JSON output: `{ results, query, authenticated, offline?, warning? }`.

### show
- Options: `--json`, `--raw`.
- Not found: JSON payload is exactly `{ "error": "not_found" }` (no message), exit 1.
- `--raw` prints `prompt.content`.

### copy
- Options: `--fill`, `--json`.
- Variable handling: parse `--VAR=value`, apply dynamic defaults, process file/path variables.
- `--fill` prompts for missing variables; Ctrl+C -> error `cancelled`, exit 130.
- Missing required variables -> `missing_variables` error with `missing` list.
- Clipboard: uses platform tools via `copyToClipboard`.
- JSON output on success: `{ success: true, id, title, characters, message }`.
- JSON output on failure: `{ success: false, error: "clipboard_failed", fallback }`, exit 1.

### render
- Options: `--fill`, `--context <path>`, `--stdin`, `--max-context <bytes>`, `--json`.
- Variable handling same as `copy`.
- Context:
  - `--stdin` reads stdin with 30s timeout and size cap (`maxContext + 1024`).
  - `--context` reads file with size cap.
  - If both, stdin wins.
  - Default max context = 204800 bytes.
  - Adds `## Context` section; adds truncation note if truncated.
- JSON output: `{ id, title, rendered, variables?, context? }`.

### export
- Options: `--format <skill|md>` (default skill), `--output-dir <dir>` (default cwd), `--all`, `--stdout`, `--json`.
- If not `--all` and no ids -> error exit 1.
- If any id not found -> error exit 1.
- `--stdout` prints content directly (no JSON summary).
- JSON output (files): `{ success, exported: [{id,file}], failed? }`.

### install
- Options: `--project`, `--all`, `--bundle <id>`, `--force`, `--json`.
- Target dir: project `.claude/skills` or `~/.config/claude/skills`.
- `--bundle`:
  - Validate bundle exists and id safe.
  - If modified and no `--force` -> `modified_by_user` error, exit 1.
  - Writes `SKILL.md` and updates manifest entry `kind: bundle`.
- Prompt ids:
  - If none -> error exit 1.
  - Unsafe id -> error, skipped.
  - Modified skill without `--force` -> skipped.
  - Writes `SKILL.md` and updates manifest entry `kind: prompt`.
- JSON output: `{ success, installed, skipped, failed, targetDir }`.

### uninstall
- Options: `--project`, `--confirm`, `--json`.
- Validates skill IDs with `isSafeSkillId`; invalid -> exit 2.
- Non-tty requires `--confirm` or exit 1.
- Removes skill dir via `rmSync({ recursive: true, force: true })` and updates manifest.
- JSON output: `{ success, removed, notFound, failed, targetDir }`.

### installed
- Options: `--personal`, `--project`, `--json`.
- Default checks both locations.
- JSON output: `{ installed, count, locations }`.

### update
- Options: `--personal`, `--project`, `--dry-run`, `--diff`, `--force`, `--json`.
- Updates installed skills based on manifest.
- Skips non JFP-generated files unless `--force`.
- Uses `generateSkillMd` / `generateBundleSkillMd`, compares hashes.
- `--dry-run` produces "updated" results without writing.
- JSON output lists `updated`, `skipped`, `unchanged`, `failed` with location.

### bundles / bundle
- `bundles`: lists bundles, JSON with id/title/description/version/promptCount/featured/author.
- `bundle <id>`: shows bundle details; JSON includes `prompts` list.
- Not found -> `not_found` error.

### suggest
- Options: `--limit` (default 3), `--semantic`, `--json`.
- Invalid limit -> `invalid_limit`.
- Empty task -> `empty_task`.
- Uses BM25 search; optional semantic rerank with `semanticRerank` (MiniLM download; fallback "hash").

### interactive (i)
- Uses `@inquirer/prompts` search UI.
- Actions: copy, view, install (personal/project), export markdown, back, exit.
- Install uses manifest + `generateSkillMd`.

### random
- Options: `--category`, `--tag`, `--copy`, `--json`.
- Filter by category/tag; if none, error `no_prompts`.
- Copy uses platform clipboard tools (xclip/xsel/pbcopy/clip).
- Non-JSON output shows preview (first 10 lines) and metadata.

### categories / tags / open / doctor / about
- `categories`: counts prompts per category, sorted by name.
- `tags`: counts per tag, sorted by count desc.
- `open <id>`: opens `https://jeffreysprompts.com/prompts/<id>` via platform open command.
- `doctor`: checks skills dirs, clipboard tool availability, bun runtime availability, registry load.
- `about`: prints banner and dynamic stats; JSON output has counts and metadata.

### status / refresh
- `status`: shows cache status, auth status, local prompts, settings.
- `refresh`: forces registry refresh and prints source (remote/cache/bundled).

### login
- `login` uses local browser flow unless `--remote` or no display.
- Local flow:
  - Opens `${JFP_PREMIUM_URL}/cli/auth?port=<port>&redirect=local`.
  - Starts local HTTP server on 127.0.0.1; callback `/callback`.
  - Expected query params: `token`, `email`, `tier`, `expires_at`, `user_id`, `refresh_token`.
  - Saves credentials; renders success/error HTML pages.
  - Server listens on port `0` (OS-assigned); binds `127.0.0.1`.
  - Missing `expires_at` defaults to now + 24h ISO string.
  - `tier` defaults to `"free"` unless `tier === "premium"`.
- Remote flow (device code):
  - POST `${JFP_PREMIUM_URL}/api/cli/device-code` with `{ client_id: "jfp-cli" }`.
  - Poll POST `${JFP_PREMIUM_URL}/api/cli/device-token` with `{ device_code, client_id: "jfp-cli" }`.
  - Handles errors: `authorization_pending`, `slow_down`, `expired_token`, `access_denied`.
  - Poll interval: `max((interval ?? 2) * 1000, 2000)`; max attempts = `min(60, timeout/pollInterval)`.
  - `slow_down` sleeps extra 5s before retry.

### logout / whoami
- `logout`: if `JFP_TOKEN` set -> error `env_token`.
- Optional `--revoke` calls `POST /cli/revoke`.
- `whoami`: if env token -> source environment; if expired -> `session_expired`, exit 1.

### save
- Requires auth and premium tier.
- POST `/cli/saved-prompts` with `{ prompt_id }`.
- If already saved (409 or code `already_saved`) -> success response with `already_saved: true`.

### sync
- Options: `--force`, `--status`, `--json`.
- `--status` prints sync metadata and auth status.
- `--status` JSON includes `synced`, `lastSync`, `promptCount`, `libraryPath`, `authenticated`, `user`.
- GET `/cli/sync?since=<lastSync>` unless `--force`.
- Writes `prompts.json` and `sync.meta.json` (version `1.0.0`).
- Incremental merge (when not `--force`): replace existing prompts by id from server, keep others, then append new.
- `syncedAt` uses `last_modified` from server or `new Date().toISOString()`.
- JSON output: `{ synced, newPrompts, totalPrompts, force, syncedAt }`.

### notes
- GET `/cli/notes/<promptId>` to list.
- POST `/cli/notes/<promptId>` with `{ content }` to add.
- DELETE `/cli/notes/<promptId>/<noteId>` to delete.
- Requires auth and premium.

### collections
- Endpoints:
  - GET `/cli/collections` (list)
  - GET `/cli/collections/<name>` (detail)
  - POST `/cli/collections` (create)
  - POST `/cli/collections/<name>/prompts` (add)
- `collections export`:
  - Resolves prompts from local registry, then offline library, then `/cli/prompts/<id>`.
  - Exports skill or md to stdout or files.

### skills
- Endpoints:
  - GET `/cli/skills` (list)
  - POST `/cli/skills/<id>/install`
  - GET `/cli/skills/<id>/export`
- `skills create` scaffolds SKILL.md template in `.claude/skills/<name>` by default.

### completion
- Generates shell completions for bash, zsh, fish.
- Detects shell from `SHELL` env if `--shell` not provided.

### serve
- MCP server using `@modelcontextprotocol/sdk` with stdio transport.
- Resources: `prompt://<id>` returns prompt content.
- Tools:
  - `search_prompts` (query/category/tags/limit)
  - `render_prompt` (id, variables, context)
- `--config` prints Claude Desktop config snippet.

### update-cli
- Checks latest GitHub release and updates binary.
- Options: `--check`, `--force`, `--json`.
- Hidden command `update-check-internal` updates cached version info.
- Uses SHA256 checksum validation.
- Self-update only for compiled binaries; if running via bun/node, prints error and exits.
- GitHub repo: `Dicklesworthstone/jeffreysprompts.com` (release API `/releases/latest`).
- Asset name mapping:
  - darwin arm64: `jfp-darwin-arm64`; darwin x64: `jfp-darwin-x64`
  - linux arm64: `jfp-linux-arm64`; linux x64: `jfp-linux-x64`
  - win32 x64: `jfp-windows-x64.exe`
- Checksum sources: `SHA256SUMS.txt` or `<asset>.sha256` in release assets.
- Update flow: download to `<current>.update-<rand>`, verify checksum, replace with `.bak` rollback, chmod 755 (non-win32), verify by running `--version` within 5s.

### help
- Prints structured help; JSON uses `getHelpData()`.

## 11) Auto-Update Check
File: `packages/cli/src/lib/auto-update.ts`
- Checks GitHub releases once per day.
- If cached update exists, prints banner (skips if `--json` or `serve`).
- Spawns detached `update-check-internal` to refresh cache.

## 12) Known Quirks
- `searchPersonal` calls `response.json()` on ApiResponse; as written, this will throw (bug). Document for parity before fixing.
