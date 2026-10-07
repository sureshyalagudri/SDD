# Tasks: Episode Sorting

**Input**: Design documents from `/specs/003-episode-sorting/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sort-control.md,
quickstart.md

**Tests**: Included. The constitution's Development Workflow gates (unit, e2e incl. no-JS and
keyboard, axe, Lighthouse) are mandatory, and research.md R7 defines the test additions for this
feature.

**Organization**: Tasks are grouped by user story. The feature touches one page (`/episodes/`)
inside the existing `src/` layout and builds on the view-toggle feature (002).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US3) — required only in user-story phases
- Every task names exact file paths

## Path Conventions

Existing single Next.js project: app code under `src/` (`src/app`, `src/components`, `src/lib`,
`src/tests/{unit,e2e}`); `@/*` resolves to `src/*`. Static output in `out/`.

---

## Phase 1: Setup

**Purpose**: No new tooling or dependencies. Confirm the baseline (including feature 002) is green
before touching the Episodes page.

- [X] T001 Run `npm run lint`, `npm test`, and `npm run build` from the repo root and confirm all pass on the current state before starting (no file changes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The sort domain logic, pre-paint bootstrap, CSS hooks, and card hook that every story
depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Create `src/lib/sort.ts` exporting: `SORT_STORAGE_KEY = "episodeSort"`; `type EpisodeSort = "newest" | "oldest" | "title-asc" | "title-desc" | "shortest" | "longest"`; `DEFAULT_SORT: EpisodeSort = "newest"`; `SORT_OPTIONS` as a readonly array of exactly six `{ value, label }` in this order — `newest` "Newest first", `oldest` "Oldest first", `title-asc` "Title A–Z", `title-desc` "Title Z–A", `shortest` "Shortest first", `longest` "Longest first"; `isEpisodeSort(value: unknown): value is EpisodeSort` (true only for the six values — data-model: "Absent or any other value ⇒ `newest`"); a module-level `const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true })`; `compareEpisodes(sort)` returning `(a, b) => number` implementing the data-model table — `newest`/`oldest` compare `publishedAt` strings desc/asc, `title-asc`/`title-desc` use `collator.compare(a.title, b.title)` asc/desc, `shortest`/`longest` compare `durationSeconds` asc/desc — and on equality falling through to `b.number - a.number` (FR-003); `sortEpisodes(list, sort)` returning a new sorted array; `type NonDefaultSort = Exclude<EpisodeSort, "newest">`; `rankEpisodes(list)` returning `Record<string /*slug*/, Record<NonDefaultSort, number>>` where each rank is the index in `sortEpisodes(list, key)`; `rankStyle(ranks: Record<NonDefaultSort, number>): CSSProperties` returning `{ "--s-oldest": n, "--s-title-asc": n, "--s-title-desc": n, "--s-shortest": n, "--s-longest": n }` (cast via `as CSSProperties`); and `sortInitScript` — a ≤ 160-byte `try/catch` IIFE reading `localStorage.getItem("episodeSort")` and setting `document.documentElement.dataset.sort=v` only when `v` is one of the six values (compare against a literal `"newest,oldest,title-asc,title-desc,shortest,longest".split(",")` or chained `==` checks)
- [X] T003 Edit `src/app/layout.tsx`: import `sortInitScript` from `@/lib/sort` and change the inline head script to `themeInitScript + viewInitScript + sortInitScript` (FR-008)
- [X] T004 [P] Edit `src/app/globals.css`: after `html.no-js .view-switcher { display: none; }` add `html.no-js .sort-control { display: none; }` (FR-009)
- [X] T005 [P] Edit `src/components/EpisodeCard.tsx`: add optional prop `style?: CSSProperties` and spread it onto the `<li className={styles.item} style={style}>`; no other markup change (FR-013)
- [X] T006 [P] Edit `src/app/episodes/page.module.css`: append the five contract rules — `:global(html[data-sort="oldest"]) .grid > li { order: var(--s-oldest); }`, and likewise for `title-asc`, `title-desc`, `shortest`, `longest` — placed after the List-view rule; add `.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }`
- [X] T007 [P] Write `src/tests/unit/sort.test.ts`: using the real `episodes` content assert for each of the six sorts that `sortEpisodes` returns 20 items and is monotonic on its key (`publishedAt` string, collator on `title`, `durationSeconds`) in the right direction and that `newest` equals `getAllEpisodes()`; tie-break test with two synthetic episodes sharing `publishedAt`/`durationSeconds`/`title` (differing in case) that higher `number` comes first; collator test that `"Élan"` sorts adjacent to `"elan"` and `"Ep 2"` precedes `"Ep 10"`; `isEpisodeSort` accepts the six values and rejects `"banana"`, `""`, `null`, `undefined`, `0`; `rankEpisodes` produces, for every non-default key, a permutation of `0..19` across slugs; `rankStyle` returns the five `--s-*` keys; `sortInitScript.length <= 160`, contains `"episodeSort"`, starts with `(function(){try{`

**Checkpoint**: `npm test` passes with the new sort suite; `npm run build` succeeds; exported HTML
`<head>` contains the `episodeSort` bootstrap; nothing visible has changed yet.

---

## Phase 3: User Story 1 - Choose a Sort Order (Priority: P1) 🎯 MVP

**Goal**: A "Sort by" select in the Episodes toolbar that re-orders the same 20 episodes in place
(in either view), with the choice visible and announced to assistive technology.

**Independent Test**: Open `/episodes/`; "Newest first" is selected; choose "Oldest first" → Ep. 1
first, Ep. 20 last, "Sorted by Oldest first" announced; choose "Title A–Z" → alphabetical;
"Shortest first" → durations ascending; works identically in List view.

### Implementation for User Story 1

- [X] T008 [P] [US1] Create `src/components/SortControl.tsx` (presentational, no `'use client'` needed if only props; mark `'use client'` only if it uses hooks): props `{ value: EpisodeSort; onChange: (next: EpisodeSort) => void; announcement: string }`; render `<div className={`sort-control ${styles.control}`}>` containing `<label htmlFor="episode-sort" className={styles.label}>Sort by</label>`, `<select id="episode-sort" className={styles.select} value={value} onChange={(e) => { const v = e.currentTarget.value; if (isEpisodeSort(v)) onChange(v); }}>` with one `<option value={o.value}>{o.label}</option>` per `SORT_OPTIONS`, and `<span className="visually-hidden" aria-live="polite">{announcement}</span>`
- [X] T009 [P] [US1] Create `src/components/SortControl.module.css`: `.control { display: inline-flex; align-items: center; gap: 0.5rem; }`; `.label { font-size: 0.875rem; font-weight: 600; color: var(--muted); }`; `.select { appearance: none; padding: 0.5rem 2.25rem 0.5rem 0.9rem; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-elev) url("data:image/svg+xml,...chevron using currentColor-safe fill %23666...") no-repeat right 0.9rem center / 0.7rem; color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }`; `.select:hover { border-color: var(--accent); }`; rely on the global `:focus-visible` rule
- [X] T010 [US1] Create `src/components/EpisodeCatalog.tsx` (`'use client'`): props `{ episodes: CardEpisode[]; ranks: Record<string, Record<NonDefaultSort, number>>; header: ReactNode }` where `CardEpisode = Pick<Episode, "number" | "slug" | "title" | "shortDescription" | "artworkSrc" | "artworkAlt" | "durationSeconds" | "publishedAt">` (export the type); state `sort` (init `DEFAULT_SORT`) and `announcement` (init `""`); `useEffect` on mount reads `document.documentElement.getAttribute("data-sort")` and sets state when `isEpisodeSort`; `onChange(next)`: if `next === sort` return; set `data-sort` on `<html>`; `localStorage.setItem(SORT_STORAGE_KEY, next)` in `try/catch`; `setSort(next)`; `setAnnouncement(`Sorted by ${label}`)`; render `<div className={styles.toolbar}>{header}<div className={styles.controls}><ViewSwitcher /><SortControl value={sort} onChange={onChange} announcement={announcement} /></div></div>` followed by `<ul className={styles.grid} aria-label="All episodes">{sortEpisodes(episodes, sort).map((e) => <EpisodeCard key={e.slug} episode={e as Episode} style={rankStyle(ranks[e.slug])} />)}</ul>`; import `styles` from `@/app/episodes/page.module.css`
- [X] T011 [US1] Edit `src/app/episodes/page.tsx`: import `EpisodeCatalog` and `rankEpisodes`; compute `const all = getAllEpisodes(); const ranks = rankEpisodes(all); const cards = all.map(({ number, slug, title, shortDescription, artworkSrc, artworkAlt, durationSeconds, publishedAt }) => ({ number, slug, title, shortDescription, artworkSrc, artworkAlt, durationSeconds, publishedAt }));` and render `<div className={styles.page}><EpisodeCatalog episodes={cards} ranks={ranks} header={<header className={styles.header}>…existing header JSX…</header>} /></div>`; remove the direct `ViewSwitcher`/`EpisodeCard` imports and the inline `<ul>`
- [X] T012 [P] [US1] Write `src/tests/unit/EpisodeCatalog.test.tsx`: render with the real episodes (projected) and `rankEpisodes`; assert the select shows "Newest first" and `li` order equals newest; `fireEvent.change(select, { target: { value: "oldest" } })` → `html[data-sort="oldest"]`, `localStorage.episodeSort === "oldest"`, first `h3` text is Episode 1's title, live region "Sorted by Oldest first"; changing to the same value again does not call `localStorage.setItem` (spy); `title-asc` → headings alphabetical by collator; preset `data-sort="longest"` before render → select value `longest` after mount; preset `data-sort="banana"` → `newest`; every `li` has inline `--s-oldest` style
- [X] T013 [US1] Write `src/tests/e2e/sorting.spec.ts` (US1 part, skip in `no-js`): helper reading the sequence of `datetime`, `h3` text, and `/^\d+:\d{2}(:\d{2})?$/` duration text from `listitem`s; for each of the six options `selectOption` on `#episode-sort` and assert exactly 20 items and the correct monotonic order (dates desc/asc; titles via `localeCompare` with `sensitivity: "base"`; durations parsed to seconds asc/desc); assert `html[data-sort]` equals the chosen value and the live region text is `Sorted by <label>`; one test switches to List view first (`button[name=List]`), changes sort, and asserts `data-view` is still `list` (US1-AC6)

**Checkpoint**: US1 demoable — all six orders work in both views and are announced.

---

## Phase 4: User Story 2 - Remember My Sort Order (Priority: P2)

**Goal**: The chosen order persists across reload, navigation, and sessions; is already in place at
first paint (no visible re-shuffle); resets to newest when cleared; ignores invalid values.

**Independent Test**: Choose "Oldest first" → reload → Ep. 1 is first with no re-shuffle; go to
`/` and back → still oldest; choose "Newest first" → stored `newest`; `"banana"` in storage → newest.

### Implementation for User Story 2

- [X] T014 [US2] Verify pre-paint ordering in the static build: run `npm run build`, open `out/episodes/index.html`, and confirm (a) every `<li>` carries `style="--s-oldest:…;--s-title-asc:…;…"`, (b) the head script contains `episodeSort`, (c) the five `html[data-sort="…"]` rules exist in the emitted CSS; fix `EpisodeCatalog`/`page.module.css` if any is missing (FR-008)
- [X] T015 [US2] Extend `src/tests/e2e/sorting.spec.ts` (US2 part, skip in `no-js`): select "Oldest first"; `page.reload({ waitUntil: "commit" })`; `waitForFunction(() => document.documentElement.dataset.sort === "oldest")`; immediately (before waiting for hydration) evaluate `getComputedStyle` `order` for every `li` and assert the `li` with the lowest `order` contains "Ep. 1" (pre-paint CSS path); then after `networkidle` assert the first `li` in DOM order contains "Ep. 1" (post-hydration reconciliation) and the select value is `oldest`; `goto("/")` then `goto("/episodes/")` → still `oldest`; select "Newest first" → `localStorage.getItem("episodeSort") === "newest"`; new test with `addInitScript(() => localStorage.setItem("episodeSort", "banana"))` → `html` has no `data-sort` and select shows `newest`; new test with cleared storage → `newest`

**Checkpoint**: Preference round-trips with no flash and safe fallbacks.

---

## Phase 5: User Story 3 - Sort and View Work Together (Priority: P3)

**Goal**: Sort and view preferences are independent, both persist together, and the toolbar
(heading + view switcher + sort control) stays usable from 320 px to 1920 px.

**Independent Test**: Set List + "Longest first" → reload → both applied; switch to Card → order
unchanged; change sort → view unchanged; at 320 px the toolbar wraps with no horizontal overflow.

### Implementation for User Story 3

- [X] T016 [US3] Tune toolbar layout in `src/app/episodes/page.module.css`: ensure `.toolbar` keeps `flex-wrap: wrap` and `.controls` wraps as a unit below the header under 768 px; add `@media (max-width: 479px) { .controls { width: 100%; justify-content: space-between; } }` so the view switcher and sort select share one row (or stack cleanly) at 320 px with no overflow; keep the `.sort-control` select `max-width: 100%`
- [X] T017 [P] [US3] Extend `src/tests/e2e/sorting.spec.ts` with an independence test (skip in `no-js`): `addInitScript` setting `episodeView="list"` and `episodeSort="longest"` → after load `data-view="list"`, `data-sort="longest"`, first `li` has the maximum duration; click "Card" → `data-sort` still `longest` and first `li` unchanged; select "Title A–Z" → `data-view` still `card` (SC-004)
- [X] T018 [P] [US3] Edit `src/tests/e2e/responsive.spec.ts`: in the existing `/episodes/` List-view variant loop also set `localStorage.episodeSort = "title-asc"` and additionally assert the toolbar — `getByRole("group", { name: "Catalog view" })` and `getByLabel("Sort by")` — are both visible and `scrollWidth <= clientWidth` at 320/768/1280/1920 px (FR-012)

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Constitution gates for the new control, no-JS/keyboard/focus-order verification,
docs, and a final clean run.

- [X] T019 [P] Extend `src/tests/e2e/sorting.spec.ts` with a `no-js`-only test: goto `/episodes/`; `.sort-control` is hidden; `html` has no `data-sort`; the 20 `listitem`s are in newest-first `datetime` order (FR-009)
- [X] T020 [P] Extend `src/tests/e2e/sorting.spec.ts` with a keyboard + focus-order test (chromium only): focus `#episode-sort`, `selectOption("oldest")` via keyboard (`ArrowDown` ×1 then `Enter`, or `page.keyboard.type`) and assert `document.activeElement.id === "episode-sort"` afterwards; then Tab forward and assert the first two focused `a` elements inside the catalog are Episode 1 and Episode 2 titles (DOM order matches visual order — research R2)
- [X] T021 [P] Edit `src/tests/e2e/a11y.spec.ts`: add a `/episodes/` variant per theme with `addInitScript` setting `episodeSort = "title-asc"` (and `episodeView = "list"` on one of them) asserting zero axe violations; the `<select>` must have an accessible name via its `<label>` (SC-005)
- [X] T022 Run `npm run lint && npm test && npm run build && npm run validate:html && npm run check:links` and fix any new errors (inline `style` custom properties are valid HTML; the `no-inline-style` rule is already off)
- [X] T023 Run `npm run lhci` and confirm `/episodes/` keeps Performance ≥ 90 and Accessibility ≥ 90 with total script size ≤ 200 KB (SC-006); if the catalog client chunk grows the budget unexpectedly, confirm `EpisodeCatalog` receives only the card-only projection (no `fullDescription`/`audioSrc`)
- [X] T024 [P] Update `README.md`: add `EpisodeCatalog`, `SortControl` to the `src/components/` line and `sort.ts` to `src/lib/`; extend the feature summary sentence to mention the six-way sort with remembered preference
- [X] T025 Execute all 15 scenarios in `specs/003-episode-sorting/quickstart.md` against `npm run preview` and record pass/fail; fix any failures before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Phase 1 — **blocks all user stories**
- **US1 (Phase 3)**: depends on Phase 2
- **US2 (Phase 4)**: depends on US1 (needs the select and catalog to exercise persistence)
- **US3 (Phase 5)**: depends on US1 (toolbar exists) — independent of US2
- **Polish (Phase 6)**: depends on all three stories

### Within Phase 2

- T002 → T003 (layout imports the module); T004, T005, T006, T007 parallel after T002

### Within Each User Story

- US1: T008 ∥ T009 ∥ T012 → T010 → T011 → T013
- US2: T014 → T015
- US3: T016 → T017 ∥ T018

### Parallel Opportunities

- Phase 2: T004–T007 together once T002 exists
- US1: SortControl component, its stylesheet, and the catalog unit test together; then catalog;
  then page; then e2e
- US3: T017 and T018 together after T016
- Polish: T019, T020, T021, T024 together; T022 → T023 → T025 sequential

---

## Parallel Example: User Story 1

```text
# After Phase 2 completes:
Parallel:  T008 (SortControl.tsx) ∥ T009 (SortControl.module.css) ∥ T012 (EpisodeCatalog unit test)
Then:      T010 (EpisodeCatalog.tsx)
Then:      T011 (episodes/page.tsx wiring)
Then:      T013 (sorting e2e, US1 part)
```

## Parallel Example: Polish

```text
Parallel:  T019 (no-js e2e) ∥ T020 (keyboard/focus-order e2e) ∥ T021 (a11y variants) ∥ T024 (README)
Then:      T022 (lint/test/build/html/links) → T023 (lhci) → T025 (quickstart run)
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1–2: sort logic + bootstrap + CSS hooks (invisible, safe to ship alone).
2. Phase 3 (US1) → **STOP and demo**: working six-way sort in both views with announcements;
   persistence already functions because the bootstrap and rank vars landed in Phase 2.

### Incremental Delivery

1. + Phase 4 (US2): proof of pre-paint order, persistence, invalid-value handling.
2. + Phase 5 (US3): sort/view independence and toolbar responsiveness.
3. Phase 6: gates green, focus-order verified, docs updated, quickstart executed.

### Notes

- One DOM only: never render multiple pre-sorted lists (research R1).
- CSS `order` is a pre-hydration bridge; `EpisodeCatalog` MUST re-render children in sorted DOM
  order after hydration so focus/reading order matches (research R2).
- `ViewSwitcher` remains unchanged; it is simply rendered inside the catalog toolbar.
- Keep `EpisodeCatalog`'s props to the card-only projection to protect the JS budget.
