# Research: Episode List & Card (Grid) View Toggle

**Feature**: 002-episode-view-toggle | **Date**: 2026-10-07

No `NEEDS CLARIFICATION` items remained in Technical Context; the decisions below resolve the
design choices the spec leaves open.

## R1. One DOM, CSS-switched layout (vs. two component trees)

- **Decision**: Render the catalog once (the existing `<ul>` of `EpisodeCard` items). The
  active view is `<html data-view="card|list">`; CSS Modules select on
  `:global(html[data-view="list"]) .grid` / `.card` to re-layout the same elements as rows.
- **Rationale**: Satisfies FR-004 (in place, no reload), FR-013 (identical content/links),
  FR-008 (attribute set pre-paint), and FR-009 (server HTML *is* Card view). Zero duplicated
  markup keeps the DOM, a11y tree, and hydration cost unchanged; a view switch is one attribute
  write (SC-001).
- **Alternatives considered**: Two React trees toggled by state (doubles markup or forces a
  client-rendered list → flash and no-JS regression); separate `EpisodeRow` component rendered
  conditionally in a client wrapper (catalog becomes client-rendered, breaking no-JS Card view).

## R2. Where the view state lives

- **Decision**: `data-view` on `<html>`, set by the existing inline `<head>` bootstrap script
  (extended, not duplicated) from `localStorage.episodeView`; only `"card"` and `"list"` are
  accepted, anything else is ignored (FR-012). `ViewSwitcher` writes the same attribute and key.
- **Rationale**: Identical pattern to `data-theme`, so no-flash behaviour is already proven in
  the theme e2e; one script keeps the inline payload tiny.
- **Alternatives considered**: Attribute on the catalog container (set by the client component
  after hydration → flash of Card view); URL query parameter (not readable at build time in a
  static export; pollutes shareable URLs); cookie (needs a server to read).

## R3. Switcher control semantics

- **Decision**: `<div role="group" aria-label="Catalog view">` containing two
  `<button type="button" aria-pressed>` controls, each with an inline SVG icon
  (`aria-hidden`) and visible text "Card" / "List"; a visually-hidden `aria-live="polite"`
  element announces "Card view selected" / "List view selected" after a change. Styled as a
  segmented control; the pressed button uses the accent colour.
- **Rationale**: Toggle buttons with `aria-pressed` are natively keyboard operable (Tab +
  Enter/Space), need no roving-tabindex code, and are recognised by all screen readers; the
  live region covers FR-003/US1-AC4 "announced to assistive technology".
- **Alternatives considered**: `role="radiogroup"` with `role="radio"` (needs arrow-key
  handling and `tabindex` management — more code for the same outcome); native
  `<select>` (poorer visual fit; two options don't warrant a dropdown); `<a href="?view=list">`
  (reload + query param, rejected in R2).

## R4. List row layout

- **Decision**: In `html[data-view="list"]`, `.grid` becomes a single-column flex/grid list;
  each `.card` becomes a horizontal row: 64 px square thumbnail · "Ep. NN" · title (wraps) ·
  duration · date. Short description is `display:none` below 960 px and shown as a single
  clamped line at ≥ 960 px. Rows have `border-bottom` dividers instead of card borders;
  `.titleLink::after` stretched-link remains so the whole row is clickable.
- **Rationale**: Meets FR-005 (required facts always visible, description optional), FR-011
  (no overflow at 320 px), US3-AC3 (title wraps, row grows), and SC-004 (≥ 2× density at 1280
  px: 3 cards ≈ 420 px tall per row of 3 vs. ~72 px per list row).
- **Alternatives considered**: `<table>` markup for List view (would require a second DOM,
  rejected in R1); hiding artwork in List view (loses visual anchor; thumbnail is cheap since the
  SVG is already loaded).

## R5. Default and persistence rules

- **Decision**: No stored value ⇒ Card (FR-006). Writing to storage is wrapped in `try/catch`;
  on failure the attribute still changes for the current page (edge case "storage blocked").
  Clearing site data returns to Card.
- **Rationale**: Mirrors theme behaviour; keeps the feature usable in private/locked-down
  browsers.
- **Alternatives considered**: Falling back to `sessionStorage` (adds branching for marginal
  benefit).

## R6. Test strategy

- **Decision**:
  - Unit (`ViewSwitcher.test.tsx`): initial pressed state from `data-view`; clicking List sets
    attribute + storage; live region text updates; invalid stored value → Card.
  - E2E (`view-toggle.spec.ts`): default Card; switch to List re-renders same 20 `<li>` in same
    order (compare `datetime` sequence); reload shows List at `commit` (no flash); navigate away
    and back keeps List; `no-js` project hides `.view-switcher` and renders Card; keyboard
    Tab + Enter switches; density: count `<li>` whose bounding box is within a 1280×800 viewport
    in each view, assert list ≥ 2× card.
  - Extend `a11y.spec.ts` and `responsive.spec.ts` to run `/episodes/` with
    `localStorage.episodeView = "list"` as an extra variant.
  - LHCI already audits `/episodes/`; no config change.
- **Rationale**: Directly maps to FR-003/004/007/008/009/010/011 and SC-001–SC-006.
- **Alternatives considered**: Visual regression snapshots (not in the existing stack; brittle).
