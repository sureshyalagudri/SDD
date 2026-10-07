# Tasks: Episode List & Card (Grid) View Toggle

**Input**: Design documents from `/specs/002-episode-view-toggle/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/view-switcher.md,
quickstart.md

**Tests**: Included. The constitution's Development Workflow gates (unit, e2e incl. no-JS and
keyboard, axe, Lighthouse) are mandatory, and plan.md/research.md R6 define the test additions
for this feature.

**Organization**: Tasks are grouped by user story so each story is an independently testable
increment. The feature touches one page (`/episodes/`) inside the existing `src/` layout.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US3) — required only in user-story phases
- Every task names exact file paths

## Path Conventions

Existing single Next.js project: app code under `src/` (`src/app`, `src/components`, `src/lib`,
`src/tests/{unit,e2e}`); `@/*` resolves to `src/*`. Static output in `out/`.

---

## Phase 1: Setup

**Purpose**: No new tooling or dependencies are required (plan Technical Context). This phase
only confirms the baseline is green before touching the Episodes page.

- [X] T001 Run `npm run lint`, `npm test`, and `npm run build` from the repo root and confirm all pass on the current `main` state before starting (no file changes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The view-state plumbing every story depends on — storage key, accept-list, pre-paint
bootstrap, and the CSS hook that hides the switcher without JavaScript.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Create `src/lib/view.ts` exporting `VIEW_STORAGE_KEY = "episodeView"`, `type EpisodeView = "card" | "list"`, `DEFAULT_VIEW: EpisodeView = "card"`, `isEpisodeView(value: unknown): value is EpisodeView` (true only for `"card"` or `"list"` — per data-model: "Absent or any other value ⇒ treated as `card`"), and `viewInitScript` — a ≤ 150-byte minified IIFE wrapped in `try/catch` that reads `localStorage.getItem("episodeView")` and sets `document.documentElement.setAttribute("data-view", v)` only when `v === "card" || v === "list"`
- [X] T003 Edit `src/app/layout.tsx` to import `viewInitScript` from `@/lib/view` and render the inline head script as `themeInitScript + viewInitScript` (single `<script dangerouslySetInnerHTML>` before stylesheets) so both preferences apply before first paint (FR-008)
- [X] T004 [P] Edit `src/app/globals.css`: directly after the existing `html.no-js .theme-toggle { display: none; }` rule add `html.no-js .view-switcher { display: none; }` (FR-009)
- [X] T005 [P] Write `src/tests/unit/view.test.ts` asserting `isEpisodeView` accepts `"card"`/`"list"`, rejects `"banana"`, `""`, `null`, `undefined`, `1`; and that `viewInitScript.length <= 150`, contains `"episodeView"`, and starts with `(function(){try{`

**Checkpoint**: `npm test` passes; `npm run build` succeeds; the exported HTML `<head>` contains
both bootstrap scripts; nothing visible has changed yet.

---

## Phase 3: User Story 1 - Switch Between Card and List View (Priority: P1) 🎯 MVP

**Goal**: A labelled Card/List switcher above the catalog that re-lays out the same 20 episodes
as a grid or as compact rows, in place, with the active option indicated visually and to
assistive technology.

**Independent Test**: Open `/episodes/`; Card grid is shown and "Card" is pressed; press "List";
the same 20 items, same order, render as rows; "List" is pressed and "List view selected" is
announced; press "Card" to return. Selecting a row title opens the episode page.

### Implementation for User Story 1

- [X] T006 [P] [US1] Create `src/components/ViewSwitcher.tsx` (`'use client'`): render `<div role="group" aria-label="Catalog view" className={`view-switcher ${styles.group}`}>` with two `<button type="button" aria-pressed={active === option}>` for `card` and `list`, each containing an inline decorative SVG icon (`aria-hidden="true"`, 16×16: 2×2 squares for Card, 3 horizontal bars for List) and a visible `<span>` label "Card" / "List"; on mount read `document.documentElement.getAttribute("data-view")`, set state to it when `isEpisodeView(...)`, else `DEFAULT_VIEW`; on press of a non-active option: set `data-view` on `<html>`, write `localStorage.setItem(VIEW_STORAGE_KEY, option)` inside `try/catch`, update state; pressing the already-active option is a no-op; include `<span className="visually-hidden" aria-live="polite">{`${label} view selected`}</span>` that updates only after a user change (empty before first interaction)
- [X] T007 [P] [US1] Create `src/components/ViewSwitcher.module.css`: `.group` as an inline-flex segmented control (`border: 1px solid var(--border)`, `border-radius: 999px`, `background: var(--bg-elev)`, `padding: 0.2rem`, `gap: 0.2rem`); `.option` buttons with `padding: 0.45rem 0.9rem`, `border-radius: 999px`, `border: 0`, `background: transparent`, `color: var(--muted)`, `display: inline-flex`, `gap: 0.4rem`, `align-items: center`, `font-weight: 600`, `cursor: pointer`; `.option[aria-pressed="true"]` with `background: var(--accent)` and `color: var(--on-accent)` (≥ 3:1 vs unpressed in both themes); hover tints `color: var(--text)`; rely on the global `:focus-visible` rule
- [X] T008 [US1] Edit `src/app/episodes/page.tsx`: import `ViewSwitcher`; wrap the existing `<header>` content and the switcher in a flex row (`className={styles.toolbar}`) so the switcher sits right-aligned beside the lede on ≥ 768 px and below it on narrower widths; keep `<ul className={styles.grid} aria-label="All episodes">` and `EpisodeCard` usage unchanged (FR-013)
- [X] T009 [US1] Edit `src/app/episodes/page.module.css`: add `.toolbar` (`display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem`); add List-view layout `:global(html[data-view="list"]) .grid { grid-template-columns: 1fr; gap: 0; border-top: 1px solid var(--border); }` placed after the existing media queries so it wins at every width
- [X] T010 [US1] Edit `src/components/EpisodeCard.module.css`: append a `:global(html[data-view="list"])` block that turns `.card` into a row — `display: grid; grid-template-columns: 64px auto 1fr auto; align-items: center; gap: 1rem; padding: 0.75rem 0.5rem; border: 0; border-radius: 0; border-bottom: 1px solid var(--border); background: transparent; box-shadow: none; transform: none;` with hover `background: var(--surface)`; `.art { width: 64px; height: 64px; aspect-ratio: 1; border-radius: var(--radius-sm); }`; `.body { display: contents; }`; `.desc { display: none; }`; `.title { grid-column: 3; }`; `.meta { grid-column: 4; justify-content: end; white-space: nowrap; }`; keep `.titleLink::after` so the whole row is clickable
- [X] T011 [P] [US1] Write `src/tests/unit/ViewSwitcher.test.tsx`: with `data-view` absent → Card button `aria-pressed="true"`, List `"false"`, live region empty; click List → `html[data-view="list"]`, `localStorage.episodeView === "list"`, List pressed, live region text "List view selected"; click List again → no change and `localStorage.setItem` not called again (spy); with `data-view="list"` preset → List pressed on mount; with `data-view="banana"` preset → Card pressed
- [X] T012 [US1] Write `src/tests/e2e/view-toggle.spec.ts` (US1 part, skip in `no-js` project): on `/episodes/` the `group` named "Catalog view" has button "Card" `aria-pressed=true`; capture the 20 `datetime` values; press "List" → `html` has `data-view="list"`, still exactly 20 `listitem`s with identical `datetime` sequence, first `li` bounding box height < 120 px (row, not card); live region contains "List view selected"; press first row's heading link → URL matches `/episodes/ep-\d{2}-[a-z0-9-]+/`; keyboard: Tab to the switcher, Enter on "Card" → `data-view="card"`

**Checkpoint**: US1 demoable — switching works, is announced, and keeps all 20 episodes and
links intact.

---

## Phase 4: User Story 2 - Remember My Preferred View (Priority: P2)

**Goal**: The chosen view persists across reloads, navigation, and browser sessions, is applied
before first paint, resets to Card when cleared, and ignores invalid stored values.

**Independent Test**: Choose List → reload → List shown immediately with no Card flash; go to `/`
and back → still List; choose Card → stored value is `card`; set storage to `"banana"` → Card.

### Implementation for User Story 2

- [X] T013 [US2] Verify and, if needed, adjust `src/lib/view.ts` + `src/app/layout.tsx` so the exported `out/episodes/index.html` `<head>` contains the `episodeView` bootstrap before any `<link rel="stylesheet">` (inspect built HTML; if Next emits stylesheets first, move the inline `<script>` to be the first child of `<head>`) — FR-008
- [X] T014 [US2] Extend `src/tests/e2e/view-toggle.spec.ts` (US2 part, skip in `no-js`): press "List"; `page.reload({ waitUntil: "commit" })` then `waitForFunction(() => document.documentElement.hasAttribute("data-view"))` and assert `data-view="list"`; `page.goto("/")` then `page.goto("/episodes/")` → still `list`; press "Card" → `localStorage.getItem("episodeView") === "card"`; new test: `addInitScript(() => localStorage.setItem("episodeView", "banana"))`, goto `/episodes/` → `html` has no `data-view` and Card is pressed; new test: `addInitScript` clearing storage → Card pressed by default

**Checkpoint**: Preference round-trips through storage with no flash and safe fallbacks.

---

## Phase 5: User Story 3 - Readable List View on Every Screen (Priority: P3)

**Goal**: List rows show thumbnail, number, title, duration, and date at 320–1920 px without
overflow; long titles wrap; wide screens get aligned columns and an optional one-line
description.

**Independent Test**: In List view at 320/768/1280/1920 px: no horizontal scroll, every row shows
the five facts, columns align at ≥ 1280 px, a long title wraps and only its own row grows.

### Implementation for User Story 3

- [X] T015 [US3] Extend the `:global(html[data-view="list"])` block in `src/components/EpisodeCard.module.css` with responsive rules: `@media (max-width: 479px)` → `.card { grid-template-columns: 56px 1fr; }`, `.art { width: 56px; height: 56px; }`, `.body > .eyebrow, .title, .meta { grid-column: 2; }` (meta stacks under title, `white-space: normal`); `@media (min-width: 960px)` → `.card { grid-template-columns: 64px 5rem 1fr minmax(0, 28rem) auto; }` and `.desc { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; color: var(--muted); }`; ensure `.title { overflow-wrap: anywhere; min-width: 0; }` so long titles wrap (US3-AC3)
- [X] T016 [P] [US3] Edit `src/tests/e2e/responsive.spec.ts`: add a second loop variant for `/episodes/` that runs `page.addInitScript(() => localStorage.setItem("episodeView", "list"))` before `goto`, asserting `data-view="list"` and `scrollWidth <= clientWidth` at 320/768/1280/1920 px; additionally at 320 px assert the first `li` contains visible text matching `/^Ep\. \d+$/`, a `time` element, and `/^\d+:\d{2}$/`
- [X] T017 [P] [US3] Extend `src/tests/e2e/view-toggle.spec.ts` with a density test (chromium only): viewport 1280×800; count `li` elements whose `boundingBox().y + height <= 800` in Card view, switch to List, count again; assert `listCount >= 2 * cardCount` (SC-004)

**Checkpoint**: All three stories independently functional; List view is responsive and dense.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Constitution gates for the new UI, no-JS verification, docs, and a final clean run.

- [X] T018 [P] Extend `src/tests/e2e/view-toggle.spec.ts` with a `no-js`-only test: goto `/episodes/`; `.view-switcher` is hidden (`toBeHidden()`); `html` has class `no-js` and no `data-view`; exactly 20 `listitem`s render in Card layout (first `li` bounding box height > 200 px) — FR-009
- [X] T019 [P] Edit `src/tests/e2e/a11y.spec.ts`: for `/episodes/` add a List-view variant in both themes — `addInitScript` setting `episodeView = "list"` alongside the theme key — and assert zero axe violations (SC-005); also assert the switcher's pressed/unpressed buttons both pass the color-contrast rule
- [X] T020 [P] Edit `src/tests/e2e/keyboard.spec.ts`: add `[aria-pressed]` to the interactive-element selector (verified: existing `button` selector already includes both switcher buttons � no change needed) so both switcher buttons are included in the Tab-order/visible-focus assertion on `/episodes/`
- [X] T021 Run `npm run build && npm run validate:html && npm run check:links` and fix any new errors (expect none — no new links or markup types)
- [X] T022 Run `npm run lhci` and confirm `/episodes/` keeps Performance ≥ 90 and Accessibility ≥ 90 and total script size stays ≤ 200 KB (SC-006); if the new client chunk pushes TTI, confirm `ViewSwitcher` is the only additional `'use client'` module
- [X] T023 [P] Update `README.md` Structure section to list `ViewSwitcher` under `src/components/` and `view.ts` under `src/lib/`, and add one sentence under the feature summary noting the Card/List switcher with remembered preference
- [X] T024 Execute all 13 scenarios in `specs/002-episode-view-toggle/quickstart.md` against `npm run preview` and record pass/fail; fix any failures before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Phase 1 — **blocks all user stories**
- **US1 (Phase 3)**: depends on Phase 2
- **US2 (Phase 4)**: depends on Phase 2 and on the switcher from US1 (T006) to exercise
  persistence end-to-end; the bootstrap itself (T002/T003) is already in place
- **US3 (Phase 5)**: depends on US1's List-view CSS (T010)
- **Polish (Phase 6)**: depends on all three stories

### Within Phase 2

- T002 → T003 (layout imports the new module); T004 and T005 parallel with T003

### Within Each User Story

- US1: T006 ∥ T007 ∥ T011 → T008 → T009 ∥ T010 → T012
- US2: T013 → T014
- US3: T015 → T016 ∥ T017

### Parallel Opportunities

- Phase 2: T004, T005 alongside T003
- US1: component (T006), its stylesheet (T007), and its unit test (T011) together; then page
  CSS (T009) and card CSS (T010) together
- US3: T016 and T017 together after T015
- Polish: T018, T019, T020, T023 together; T021 → T022 sequential after a build

---

## Parallel Example: User Story 1

```text
# After Phase 2 completes:
Parallel:  T006 (ViewSwitcher.tsx) ∥ T007 (ViewSwitcher.module.css) ∥ T011 (ViewSwitcher unit test)
Then:      T008 (episodes/page.tsx)
Parallel:  T009 (episodes/page.module.css) ∥ T010 (EpisodeCard.module.css list rules)
Then:      T012 (view-toggle e2e, US1 part)
```

## Parallel Example: Polish

```text
Parallel:  T018 (no-js e2e) ∥ T019 (a11y variant) ∥ T020 (keyboard selector) ∥ T023 (README)
Then:      T021 (build + html + links) → T022 (lhci) → T024 (quickstart run)
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1–2: bootstrap + no-JS hook (invisible, safe to ship alone).
2. Phase 3 (US1) → **STOP and demo**: working Card/List switcher with announcement; preference
   already persists because the bootstrap landed in Phase 2, even before US2's verification.

### Incremental Delivery

1. + Phase 4 (US2): hardened persistence, no-flash proof, invalid-value handling.
2. + Phase 5 (US3): responsive row rules and density proof.
3. Phase 6: gates green, docs updated, quickstart executed.

### Notes

- Never add a second rendering of the episode list; both views MUST share one DOM (research R1).
- Keep `ViewSwitcher` the only new `'use client'` module to protect the JS budget.
- `data-view` lives on `<html>` (not the catalog container) so the pre-paint script can set it.
