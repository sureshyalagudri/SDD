# Contract: Sort Control, Bootstrap & Catalog Ordering

**Feature**: 003-episode-sorting | **Date**: 2026-10-07

## Bootstrap (inline `<head>` script, `src/lib/sort.ts`)

```text
read  localStorage["episodeSort"]
if value ∈ {newest, oldest, title-asc, title-desc, shortest, longest}
     → document.documentElement.dataset.sort = value
else → leave attribute absent (newest / DOM order)
```

Concatenated after the theme and view bootstraps in `src/app/layout.tsx`; ≤ 200 bytes; wrapped in
`try/catch`.

## `src/lib/sort.ts` API

| Export | Type | Contract |
|--------|------|----------|
| `SORT_STORAGE_KEY` | `"episodeSort"` | storage key |
| `EpisodeSort` | union of six string literals | see data-model |
| `DEFAULT_SORT` | `"newest"` | |
| `SORT_OPTIONS` | `readonly { value: EpisodeSort; label: string }[]` | exactly six, in the order: Newest first, Oldest first, Title A–Z, Title Z–A, Shortest first, Longest first |
| `isEpisodeSort(v: unknown)` | type guard | true only for the six values |
| `compareEpisodes(sort)` | `(a, b) => number` | per data-model table; equal keys ⇒ `b.number - a.number` |
| `sortEpisodes(list, sort)` | `Episode[]` (new array) | `[...list].sort(compareEpisodes(sort))` |
| `rankEpisodes(list)` | `Record<slug, Record<Exclude<EpisodeSort,"newest">, number>>` | ranks per non-default sort |
| `rankStyle(ranks[slug])` | `CSSProperties` | `{ "--s-oldest": n, … }` for inline style |
| `sortInitScript` | string | bootstrap above |

## `EpisodeCatalog` (client component, `src/components/EpisodeCatalog.tsx`)

**Props**: `episodes: CardEpisode[]` (newest-first, card-only projection), `ranks`, `header:
ReactNode` (server-rendered page header).

**Markup contract**

```html
<div class="toolbar">
  {header}
  <div class="controls">
    <ViewSwitcher/>                       <!-- unchanged component -->
    <div class="sort-control …">
      <label for="episode-sort">Sort by</label>
      <select id="episode-sort">
        <option value="newest" selected>Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="title-asc">Title A–Z</option>
        <option value="title-desc">Title Z–A</option>
        <option value="shortest">Shortest first</option>
        <option value="longest">Longest first</option>
      </select>
      <span class="visually-hidden" aria-live="polite"></span>
    </div>
  </div>
</div>
<ul class="grid" aria-label="All episodes">
  <li style="--s-oldest:19;--s-title-asc:…;…"> …EpisodeCard… </li>   × 20
</ul>
```

**Behaviour**

| Event | Effect |
|-------|--------|
| SSR | `<ul>` children in newest order; each `<li>` carries rank vars; `<select>` shows "Newest first" |
| mount | read `html[data-sort]`; if valid, set state (select value + DOM order re-rendered to match); else `newest` |
| `change` on select with a new value | set `html[data-sort]`; `localStorage.episodeSort = value` (try/catch); re-render `<li>` in `sortEpisodes(episodes, value)` order using `key={slug}`; live region ← `Sorted by {label}`; focus stays on the select |
| `change` to the current value | no-op |
| view switch | handled entirely by `ViewSwitcher`; sort state and DOM order unaffected |
| JavaScript disabled | component never hydrates; `html.no-js .sort-control { display:none }`; no `data-sort` ⇒ newest |

## CSS contract (`src/app/episodes/page.module.css`)

```css
:global(html[data-sort="oldest"])     .grid > li { order: var(--s-oldest); }
:global(html[data-sort="title-asc"])  .grid > li { order: var(--s-title-asc); }
:global(html[data-sort="title-desc"]) .grid > li { order: var(--s-title-desc); }
:global(html[data-sort="shortest"])   .grid > li { order: var(--s-shortest); }
:global(html[data-sort="longest"])    .grid > li { order: var(--s-longest); }
```

Plus `.controls { display:flex; flex-wrap:wrap; gap:0.75rem; align-items:center }` so the view
switcher and sort control sit together and wrap on narrow screens. These rules must apply in both
Card (multi-column grid) and List (single column) layouts.

## Invariants

- Exactly 20 `<li>` in every order; each `<li>` contains one `<h3>` with one
  `<a href="/episodes/<slug>/">`.
- For any order, the visual sequence (by `getComputedStyle(li).order` pre-hydration, by DOM
  order post-hydration) equals `sortEpisodes(episodes, sort)`.
- Changing sort never changes `html[data-view]`; changing view never changes `html[data-sort]`.
- Toolbar has no horizontal overflow at 320/768/1280/1920 px.
