# Implementation Plan: Episode Sorting

**Branch**: `003-episode-sorting` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-episode-sorting/spec.md`

## Summary

Add a "Sort by" `<select>` to the Episodes toolbar with six fixed orders (newest/oldest,
title A–Z/Z–A, shortest/longest). The catalog stays a single server-rendered list in
newest-first DOM order; at build time every `<li>` receives CSS custom properties holding its
rank under each non-default order. The active order is `<html data-sort>` — set pre-paint by the
existing head bootstrap from `localStorage.episodeSort` — and CSS `order: var(--s-<key>)`
re-positions items instantly with no JavaScript re-sort and no flash (FR-008). After hydration a
small client component (`EpisodeCatalog`) re-renders the same items in sorted DOM order so
keyboard/assistive-technology sequence matches the visual sequence (accessibility), which is
visually a no-op. Without JavaScript: newest-first, control hidden.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (build-time only) — unchanged

**Primary Dependencies**: Next.js 15 App Router (`output: 'export'`), React 19, CSS Modules —
no new dependencies

**Storage**: Browser `localStorage` key `episodeSort` with value
`newest | oldest | title-asc | title-desc | shortest | longest`; absent/invalid ⇒ `newest`

**Testing**: Vitest (comparators, rank table, tie-break, `EpisodeCatalog` select behaviour),
Playwright (each order's sequence, pre-paint order via computed `order`, persistence, view/sort
independence, no-JS, keyboard, toolbar at 320–1920 px, axe both themes), Lighthouse CI
(`/episodes/` already audited)

**Target Platform**: Static host over HTTPS; evergreen browsers — unchanged

**Project Type**: static web application (feature within the existing project)

**Performance Goals**: Sort change = one attribute write + CSS re-layout (< 16 ms; SC-001 ≤ 100
ms). `/episodes/` keeps Lighthouse Performance/Accessibility ≥ 90 (SC-006). Added client JS
≤ 6 KB gz (catalog component + card markup + 20 × card-only episode props; `fullDescription`
excluded from props)

**Constraints**: Single DOM; pre-paint order without JS re-sort; DOM order reconciled to visual
order after hydration; newest-first is the no-JS and no-preference default; `<select>` hidden
under `html.no-js`; sort and view preferences independent; locale-aware title compare with
`sensitivity: "base"`; tie-break `number` desc

**Scale/Scope**: 1 page; 1 new lib module; 1 new client component (absorbs the catalog `<ul>` and
the existing `ViewSwitcher` placement); CSS additions to 1 stylesheet; 2 unit specs + 1 e2e spec;
small additions to 2 existing e2e specs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Evidence |
|------------------------|--------|----------|
| I. Static-First | PASS | Ranks computed at build; sorting is CSS + client-only state; no server, API, or fetch |
| II. Accessibility & Semantic HTML | PASS | Native `<select>` with visible `<label>`; selected option exposed natively; polite live region on change; DOM order reconciled to visual order post-hydration so focus/reading order matches (WCAG 1.3.2 / 2.4.3); axe matrix extended |
| III. Performance Budget | PASS (verify) | `/episodes/` first-load grows by the catalog client chunk (~5 KB gz incl. card-only props); budget headroom ≈ 90 KB; LHCI gate unchanged |
| IV. Content & Asset Integrity | PASS | No new assets; `content/episodes.ts` untouched (FR-013) |
| V. Simplicity | PASS | No dependency, no state library; native `<select>`; ranks are 5 integers per item |
| Works without JS | PASS | Server HTML is newest-first; `.no-js` hides the select; CSS `order` only engages when `data-sort` is set by the bootstrap |
| HTML validates / links resolve | PASS | Inline `style="--s-…"` custom properties are valid; no new links |

**Pre-research gate result**: PASS — no deviations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-episode-sorting/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sort-control.md     # select markup, storage, rank vars, CSS hooks, announcement
└── tasks.md                # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── sort.ts                       # NEW: EpisodeSort, SORT_OPTIONS, isEpisodeSort, compareEpisodes,
│   │                                 #      rankEpisodes (slug → {oldest,title-asc,…}), sortInitScript
│   ├── view.ts                       # unchanged
│   └── theme.ts                      # unchanged
├── app/
│   ├── layout.tsx                    # EDIT: inline script = theme + view + sort bootstraps
│   ├── globals.css                   # EDIT: html.no-js .sort-control { display: none }
│   └── episodes/
│       ├── page.tsx                  # EDIT: render <EpisodeCatalog episodes={cardData} header={<header/>} />
│       └── page.module.css           # EDIT: 5 rules html[data-sort="…"] .grid > li { order: var(--s-…) }
│                                     #       + .controls wrapper for ViewSwitcher + SortControl
├── components/
│   ├── EpisodeCatalog.tsx            # NEW ('use client'): owns sort state; renders toolbar (header slot,
│   │                                 #      ViewSwitcher, SortControl) and the <ul> of EpisodeCard in
│   │                                 #      sorted order; sets html[data-sort] + localStorage; live region
│   ├── SortControl.tsx               # NEW: <label> + <select> (presentational; props value/onChange)
│   ├── SortControl.module.css        # NEW
│   ├── EpisodeCard.tsx               # EDIT: accept optional `style` (rank vars) on the <li>
│   └── ViewSwitcher.tsx              # unchanged (now rendered inside EpisodeCatalog)
└── tests/
    ├── unit/sort.test.ts             # NEW: comparators, ranks, tie-break, invalid values, script size
    ├── unit/EpisodeCatalog.test.tsx  # NEW: select changes order/attr/storage/announcement
    └── e2e/
        ├── sorting.spec.ts           # NEW
        ├── a11y.spec.ts              # EDIT: /episodes/ with a non-default sort, both themes
        └── responsive.spec.ts        # EDIT: toolbar with both controls at 320–1920 px
```

**Structure Decision**: The catalog `<ul>` and the toolbar controls move into one client component
(`EpisodeCatalog`) so sort state has a single owner and DOM order can be reconciled; the page
header remains server JSX passed in as a prop. `EpisodeCard` is imported by the client component
and therefore ships to the client — acceptable (≈ 1 KB) and it keeps one card implementation.
Rank variables are emitted on each `<li>` as inline `style`, so first paint is correct from static
HTML alone.

## Complexity Tracking

No constitution violations; table intentionally empty.

## Post-Design Constitution Re-check

- Static-First / Integrity: unchanged.
- Accessibility: contract fixes native `<select>` + label + live region and the post-hydration
  DOM reconciliation; CSS `order` is only a pre-hydration bridge, never the final state when JS
  runs.
- Performance: props are card-only (`fullDescription` stripped); LHCI remains the gate.
- Simplicity: rejected alternatives (JS-only sort with flash, duplicated pre-sorted lists, URL
  params) recorded in research.md.

**Post-design gate result**: PASS.
