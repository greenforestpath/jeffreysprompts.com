# Prompt Deck (Streamdeck) - Design Doc

**Status:** Draft
**Owner:** CFWOS
**Date:** 2026-01-24

---

## Summary

Create a fast, visual "Prompt Deck" overlay in the JeffreysPrompts web app: a
hotkey-driven grid of prompt tiles with icons. Click to copy prompt content to
clipboard instantly. This solves the "I'm lazy to type high-bandwidth prompts"
problem, especially when working on a VPS via WezTerm.

---

## Decision Context

- Primary pain: clipboard friction when working on a VPS via SSH.
- Browser clipboard on Mac is reliable; terminal clipboard across SSH is not.
- Web overlay delivers 80% of the value now with low implementation cost.
- Native/global hotkey overlays can be explored after the flow is validated.

---

## Goals

- **Zero-friction prompt access**: open deck with a hotkey, click to copy.
- **Visual muscle memory**: icon + color + title for rapid selection.
- **Mac clipboard support**: use browser clipboard (not VPS terminal clipboard).
- **Fast**: <200ms open; <50ms copy feedback.

## Non-Goals

- No user accounts or cloud sync (for now).
- No marketplace or paid features.
- No heavy backend search infrastructure.

---

## Primary Workflow (Ergonomics)

**VPS + WezTerm (your default):**
1. SSH tunnel the web app: `ssh -L 3000:localhost:3000 ubuntu@vps`.
2. Open `http://localhost:3000` on Mac.
3. Press hotkey (e.g., `Cmd+Shift+P`) to open deck.
4. Click prompt tile -> copied to Mac clipboard -> paste into Claude/Codex.

**Local Mac (fallback):**
1. Run web app locally.
2. Use the same hotkey/overlay.

This bypasses terminal clipboard issues and makes copying reliable.

---

## UX Requirements

### Trigger
- Global hotkey on the site: **Cmd+Shift+P** (or **Cmd+K** if not used).
- A visible UI entry: "Prompt Deck" button in header/footer.

### Layout
- Fullscreen overlay with a centered grid of prompt tiles.
- Category filters at top (chips). Optional search input.
- Tiles show:
  - Icon (by category)
  - Prompt title
  - Short description
  - Optional "fav" indicator

### Actions
- **Primary click**: copy prompt content to clipboard.
- **Secondary**: open prompt detail page in new tab.
- Copy feedback: toast + subtle tile flash.

### Accessibility
- Keyboard navigation (arrow keys + Enter).
- ESC to close.
- Announce copy events via screen reader.

---

## Visual Language

- Bright category colors to create muscle memory.
- Icon set: Lucide or Heroicons.
- 6-8 tiles per row on desktop; 2-3 on mobile.
- Respect existing design system (Tailwind + shadcn).

---

## Data Model

Uses existing prompt registry (`@jeffreysprompts/core/prompts/registry`).
No new backend needed.

Optional (later):
- `favorites` stored in localStorage.

---

## Technical Approach

### Frontend
- New overlay component: `PromptDeckOverlay.tsx`.
- Hook: `useHotkeys` (already used or implement simple key listener).
- Uses `navigator.clipboard.writeText`.
- Pulls prompts from core registry.

### Files (proposed)
```
apps/web/src/components/PromptDeck/
  PromptDeckOverlay.tsx
  PromptTile.tsx
  PromptDeckButton.tsx
```

### Clipboard
- Use existing clipboard helper (`apps/web/src/lib/clipboard` if present).
- Fallback: show prompt content if clipboard fails.

---

## Implementation Plan

### Phase 1 - MVP (1-2 days)
- Overlay + grid of prompts
- Hotkey to open/close
- Copy on click + toast
- Basic category filters

### Phase 2 - Flow polish (1-2 days)
- Keyboard navigation
- Search bar in overlay
- Favorites (localStorage)

### Phase 3 - Power features (optional)
- "Send to agent" integration (ntm, clipboard templates)
- User-defined prompt packs

---

## Risks / Edge Cases

- Clipboard permissions: must be invoked on user gesture (click). OK.
- Hotkey collisions: use Cmd+Shift+P (less common than Cmd+K).
- Huge prompt content: ensure copy handles large strings gracefully.

---

## Success Metrics

- Time to prompt copy < 5 seconds from idea.
- >=80% of prompt copies use deck vs manual search.
- No clipboard failures in Mac browser.

---

## Notes

This design is intentionally local-first and zero-backend. It fits the
"Unix tools + UI shell" philosophy while solving the highest friction point:
getting high-bandwidth prompts into Claude/Codex with minimal typing.
