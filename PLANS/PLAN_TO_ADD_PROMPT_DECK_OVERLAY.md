# PLAN: Prompt Deck Overlay - Implementation Plan

**Plan version:** v2  
**Last updated:** 2026-01-24

---

## Executive Summary

Add a hotkey-driven "Prompt Deck" overlay to the JeffreysPrompts web app. The
deck is a full-screen grid of prompt tiles with icons and category colors.
Clicking a tile copies the prompt text to the clipboard with instant feedback.
The core goal is to make prompt usage feel like a streamdeck: fast, visual, and
low friction, especially when working on a VPS and pasting into Claude/Codex on
the Mac.

---

## Decision Context

### Why a web overlay now
- Primary pain: terminal clipboard friction when working on a VPS via SSH.
- Browser clipboard is reliable on Mac; terminal clipboard across SSH is not.
- A hotkey-driven web overlay delivers most of the benefit without new native
  app complexity.

### Why not a native overlay yet
- Native/global hotkeys require OS-specific packaging (Raycast/Alfred/Tauri).
- Slower iteration and heavier maintenance.
- We can validate the workflow and UX using the web app first.

### Future upgrade path
- If the web overlay proves sticky, evolve to:
  - Raycast/Alfred plugin, or
  - lightweight menubar app (Tauri/Electron), or
  - OS-level shortcut that opens the overlay instantly.

---

## Goals, Non-Goals, Success Metrics

### Goals
- Open the deck in <200ms and copy in <50ms after click.
- One hotkey to open/close the deck from anywhere in the app.
- Copy works reliably on Mac browser clipboard (not VPS terminal clipboard).
- Clear visual categories for muscle memory.
- Usable with keyboard only (arrow keys + Enter + Esc).

### Non-Goals (for now)
- No user accounts or cloud sync.
- No new backend services.
- No marketplace or sharing features.

### Success Metrics
- >=80% of prompt copies use the deck vs manual search.
- Time from "idea to pasted prompt" under 10 seconds.
- 0 clipboard failure reports in normal use.

---

## UX Flow (Primary)

### VPS (default workflow)
1. `ssh -L 3000:localhost:3000 ubuntu@vps`
2. Open `http://localhost:3000` in Mac browser.
3. Press hotkey (Cmd+Shift+P).
4. Click a tile -> prompt copies to Mac clipboard.
5. Paste into Claude/Codex.

### Local Mac (fallback)
1. Run web app locally.
2. Same hotkey + click to copy.

---

## Architecture and Data

### Data Sources
- Use existing prompt registry in the web app (single source of truth).
- Optional: store favorites in localStorage (phase 2).

### Components (proposed)
```
apps/web/src/components/PromptDeck/
  PromptDeckOverlay.tsx
  PromptTile.tsx
  PromptDeckButton.tsx
```

### Integration Points
- Hotkey handler (simple `keydown` listener or existing hotkey hook).
- Clipboard helper (use `navigator.clipboard.writeText` with click gesture).
- Toast feedback (reuse existing toast system).

---

## Implementation Phases

### Phase 0 - Read/Map Existing Code
- Find current prompt registry and search components.
- Identify clipboard helper and toast utilities.
- Decide hotkey to avoid collisions.

### Phase 1 - MVP
- Add overlay shell + grid.
- Show prompt tiles with icon, title, short description.
- Click to copy + toast feedback.
- Cmd+Shift+P toggles open/close.
- Esc closes.

### Phase 2 - Flow Polish
- Keyboard navigation (arrow keys + Enter).
- Category filters (chips).
- Search input inside overlay.
- Favorites (localStorage) and filter toggle.

### Phase 3 - Power Features (Optional)
- "Send to agent" button (copy with template or deep link).
- User-defined prompt packs.
- Export selected prompts to markdown bundle.

---

## Risks and Mitigations

- Clipboard permission: only copy on user click to satisfy browser security.
- Hotkey collisions: avoid Cmd+K if Spotlight is already used.
- Large prompt strings: verify copy works with >10k chars.

---

## Testing and Verification

Manual checks:
- Hotkey opens/closes overlay.
- Click copies to clipboard with toast.
- Works in Chrome/Safari on Mac.
- Works while connected to VPS via SSH tunnel.
- Keyboard navigation works end to end.

---

## Related Docs

- Design: `designs/prompt-deck.md`
