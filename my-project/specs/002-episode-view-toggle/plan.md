# Implementation Plan: Episode List & Card (Grid) View Toggle

**Branch**: `002-episode-view-toggle` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-episode-view-toggle/spec.md`

## Summary

Add a two-option view switcher ("Card" grid / "List" rows) above the Episodes catalog. The
catalog keeps a **single server-rendered DOM**; the active view is a `data-view` attribute on
`<html>` that CSS reads to lay the same `<li>` items out as a grid or as compact rows. The
visitor's choice is stored in `localStorage` and re-applied by the existing inline `<head>`
bootstrap script before first paint (same mechanism as the theme), so there is no flash,
no duplicate markup, no reload, and — without JavaScript — the default Card grid renders and
the switcher is hidden. The only new client code is a ~1 KB `ViewSwitcher` component.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (build-time only) — unchanged from 001

**Primary Dependencies**: Next.js 15 App Router (`output: 'export'`), React 19, CSS Modules +
custom properties — no new runtime or dev dependencies

**Storage**: Browser `localStorage` key `episodeView` with value `card` | `list`; absent or
invalid ⇒ `card`. No server, no cookies.

**Testing**: Existing stack — Vitest + RTL (switcher unit test), Playwright (switch, persistence
/no-flash, no-JS, keyboard, viewport matrix in List view, axe both views × both themes, density
check for SC-004), Lighthouse CI (existing `/episodes/` URL already audited)

**Target Platform**: Static host over HTTPS; evergreen browsers — unchanged

**Project Type**: static web application (feature within the existing single Next.js project)

**Performance Goals**: View switch is a single attribute flip (< 16 ms, satisfies SC-001 ≤ 100 ms);
`/episodes/` keeps Lighthouse Performance/Accessibility ≥ 90 (SC-006); added JS ≤ 2 KB gz

**Constraints**: One DOM for both views (no duplicated 20-item lists); preference applied before
first paint; Card view is the no-JS and no-preference default; switcher hidden under
`html.no-js`; both views AA-compliant in light and dark; no horizontal overflow 320–1920 px

**Scale/Scope**: 1 page affected (`/episodes/`); 1 new component; 1 new lib module; CSS additions
to 2 stylesheets; 1 unit spec + 1 e2e spec, small additions to 2 existing e2e specs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Evidence |
|------------------------|--------|----------|
| I. Static-First | PASS | Pure client-side preference; no server, API, or runtime fetch introduced |
| II. Accessibility & Semantic HTML | PASS | Switcher is a `role="group"` of two `<button aria-pressed>` controls with visible labels; selection announced via `aria-pressed` + polite live region; list rows keep the same semantic `<article>`/heading/link structure; axe gate extended to List view |
| III. Performance Budget | PASS | +1 client component (~1 KB) and +~120 B inline script; images unchanged; `/episodes/` already in LHCI URL list |
| IV. Content & Asset Integrity | PASS | No new assets; no build-time fetch; content modules untouched (FR-013) |
| V. Simplicity | PASS | No new dependency, no state library, no routing change; CSS attribute switch instead of two component trees |
| Works without JS | PASS | Server HTML is the Card grid; switcher hidden by `.no-js` rule; List view requires JS by design (FR-009) |
| HTML validates / links resolve | PASS | Same markup; no new links |
| No secrets / HTTPS | PASS | N/A |

**Pre-research gate result**: PASS — no deviations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-episode-view-toggle/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── view-switcher.md # UI + storage contract for the switcher and the two layouts
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── view.ts                      # NEW: VIEW_STORAGE_KEY, EpisodeView type, viewInitScript
│   └── theme.ts                     # unchanged (themeInitScript)
├── app/
│   ├── layout.tsx                   # EDIT: inline script = themeInitScript + viewInitScript
│   └── episodes/
│       ├── page.tsx                 # EDIT: render <ViewSwitcher /> above the catalog <ul>
│       └── page.module.css          # EDIT: :global(html[data-view="list"]) .grid → single column rows
├── components/
│   ├── ViewSwitcher.tsx             # NEW ('use client'): Card / List segmented control
│   ├── ViewSwitcher.module.css      # NEW
│   └── EpisodeCard.module.css       # EDIT: :global(html[data-view="list"]) .card → row layout
├── tests/
│   ├── unit/ViewSwitcher.test.tsx   # NEW
│   └── e2e/
│       ├── view-toggle.spec.ts      # NEW: switch, persist/no-flash, no-JS, keyboard, density
│       ├── a11y.spec.ts             # EDIT: add List-view variant for /episodes/
│       └── responsive.spec.ts       # EDIT: add List-view variant for /episodes/
└── app/globals.css                  # EDIT: html.no-js .view-switcher { display: none }
```

**Structure Decision**: Feature slots into the existing `src/` layout from 001. No new
directories. The view state lives on `<html>` (like `data-theme`) so a single bootstrap script
can apply both preferences before paint; CSS Modules reach it with `:global(html[data-view])`.

## Complexity Tracking

No constitution violations; table intentionally empty.

## Post-Design Constitution Re-check

Re-evaluated after Phase 1 (research.md, data-model.md, contracts/view-switcher.md,
quickstart.md):

- Static-First / Content Integrity: unchanged — no server, no new assets.
- Accessibility: contract fixes `role="group"` + `aria-pressed` + live-region announcement and
  requires List-view rows to keep heading/link semantics; both views added to the axe matrix.
- Performance: single DOM, CSS-only re-layout; switcher is the only new client code.
- Simplicity: rejected alternatives (two component trees, URL query param, `<select>`) recorded
  in research.md.

**Post-design gate result**: PASS.
