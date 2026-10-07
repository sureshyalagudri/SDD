# Research: Episode Sorting

**Feature**: 003-episode-sorting | **Date**: 2026-10-07

No `NEEDS CLARIFICATION` remained in Technical Context. The decisions below resolve the open
design choices, with the hardest one first: how to honour FR-008 ("applied before first paint")
on a static site where the HTML is baked in newest-first order.

## R1. Pre-paint ordering without a JavaScript re-sort

- **Decision**: At build time compute each episode's rank (0–19) under every non-default order and
  emit them on the `<li>` as CSS custom properties:
  `style="--s-oldest:3;--s-title-asc:11;--s-title-desc:8;--s-shortest:15;--s-longest:4"`.
  The head bootstrap sets `<html data-sort="…">` from storage. CSS in `page.module.css`:
  `:global(html[data-sort="oldest"]) .grid > li { order: var(--s-oldest); }` (one rule per
  non-default key). `.grid` is already `display: grid` (and a single column in List view), so
  `order` re-positions items with no script. `newest` uses DOM order (no rule).
- **Rationale**: Guarantees the remembered order is visible on first paint from static HTML + CSS
  alone (FR-008, SC-003) — the same proven mechanism as theme/view. 100 small integers of inline
  style is negligible.
- **Alternatives considered**: Sort in JS after hydration only (visible re-shuffle on load —
  violates FR-008); pre-render six copies of the list and show one (6× DOM, 6× a11y tree,
  rejected); `<template>` per order cloned by script (still a post-paint swap).

## R2. Reconciling DOM order with visual order

- **Decision**: After hydration, `EpisodeCatalog` (client) renders the `<ul>` children in the
  *actual sorted order* and drops the reliance on CSS `order` (the rule still applies but ranks
  now equal DOM positions, so it is a no-op). Each `<li>` keeps `key={slug}` so React moves nodes
  rather than re-creating them.
- **Rationale**: CSS `order` changes visual position but not DOM/focus/reading order; WCAG
  1.3.2 "Meaningful Sequence" and 2.4.3 "Focus Order" require they match. The pre-paint CSS path
  is only a bridge until React takes over; with JS disabled there is no non-default order, so no
  mismatch can occur.
- **Alternatives considered**: Leave CSS `order` as the final state (fails focus-order for
  keyboard/screen-reader users); add `aria-flowto` chains (poorly supported, brittle).

## R3. Control type

- **Decision**: Native `<select id="sort">` with a visible `<label for="sort">Sort by</label>`
  and six `<option value>`s; styled with CSS (custom chevron, tokens) but keeping native
  behaviour. A visually-hidden `aria-live="polite"` region announces "Sorted by {label}" after a
  change. Wrapped in `<div class="sort-control">` so `html.no-js .sort-control { display:none }`
  hides it without JavaScript.
- **Rationale**: Six options exceed a sensible segmented group; native `<select>` is fully
  keyboard operable, exposes the selected option to assistive tech (FR-005) with zero ARIA code,
  works on mobile with the platform picker, and costs no bundle size.
- **Alternatives considered**: Custom listbox/menu (hundreds of lines of ARIA + focus code);
  radio group of six (too wide for the toolbar on mobile); sort-direction toggle + key dropdown
  (two controls for one decision; harder to persist and announce).

## R4. Comparators, locale, and ties

- **Decision**: `compareEpisodes(sort)` in `src/lib/sort.ts`:
  - `newest`/`oldest`: `publishedAt` string compare (ISO dates sort lexically), desc/asc
  - `title-asc`/`title-desc`: `new Intl.Collator("en", { sensitivity: "base", numeric: true })`
    on `title`, asc/desc
  - `shortest`/`longest`: `durationSeconds` numeric asc/desc
  - every comparator falls through to `b.number - a.number` on equality (FR-003)
  `rankEpisodes(episodes)` returns `Record<slug, Record<NonDefaultSort, number>>` built from the
  five sorted arrays; `getAllEpisodes()` (newest) is unchanged and remains the DOM order.
- **Rationale**: Deterministic, stable, locale-aware for accented titles (edge case), and the
  same function serves build-time ranks, client re-sorting, and unit tests, so the three can
  never disagree.
- **Alternatives considered**: `localeCompare` without a collator (per-call overhead, no
  `numeric` option); stripping leading articles (spec says sort titles as displayed).

## R5. State ownership and persistence

- **Decision**: `EpisodeCatalog` owns `sort` state (initialised from `html[data-sort]` on mount,
  default `newest`). On change: set `html[data-sort]`, `localStorage.episodeSort = value` in
  `try/catch`, update state, announce. Only the six known values are accepted anywhere
  (FR-011). `ViewSwitcher` is rendered inside the catalog toolbar but keeps its own independent
  state and key (FR-013, SC-004).
- **Rationale**: Mirrors theme/view; one owner for sort avoids prop drilling and duplicated
  storage logic. Storage key `episodeSort` sits beside `episodeView`.
- **Alternatives considered**: URL `?sort=` (not readable at build; pollutes shareable URLs;
  conflicts with static export); React context (overkill for one component).

## R6. Client payload

- **Decision**: `page.tsx` maps episodes to a card-only shape (omit `fullDescription`,
  `audioSrc`) plus the rank map, and passes that to `EpisodeCatalog`. `EpisodeCard` gains an
  optional `style` prop for the rank variables and otherwise is unchanged.
- **Rationale**: Keeps the serialized props small (~4 KB) and the JS delta ≈ 5 KB gz; stays far
  inside the 200 KB budget and should not move Lighthouse scores.
- **Alternatives considered**: Passing full `Episode[]` (adds ~10 KB of descriptions to the
  payload for no benefit); a separate client-only `EpisodeCardLite` (duplicate markup/styles).

## R7. Test strategy

- **Decision**:
  - Unit `sort.test.ts`: each comparator's sequence over the real 20 episodes (checks first/last
    and monotonicity), tie-break with synthetic duplicates, collator on accented/case variants,
    `isEpisodeSort` accept-list, `sortInitScript.length ≤ 200`, ranks are a permutation of 0..19.
  - Unit `EpisodeCatalog.test.tsx`: changing the select re-orders `<li>` keys, sets
    `html[data-sort]`, writes storage once, announces; invalid preset → newest.
  - E2E `sorting.spec.ts`: for each of the six options assert the sequence of `datetime` /
    heading text / duration text is correctly ordered; pre-paint: with stored `oldest`, read
    `getComputedStyle(li).order` at `commit` before hydration and assert the first visual item
    (lowest `order`) is Episode 1; persistence across reload/navigation; sort ↔ view independence
    (SC-004); `no-js` hides `.sort-control` and shows newest-first; keyboard: focus select, press
    ArrowDown + Enter; toolbar no-overflow at 320/768/1280/1920; axe `/episodes/` with
    `episodeSort=title-asc` in both themes.
  - LHCI: `/episodes/` already audited; assert scores unchanged (≥ 90).
- **Rationale**: Covers FR-002–FR-013 and SC-001–SC-006 directly.
- **Alternatives considered**: Snapshot of the full HTML order (brittle to copy edits).
