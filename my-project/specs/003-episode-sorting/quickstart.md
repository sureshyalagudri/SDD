# Quickstart: Episode Sorting

**Feature**: 003-episode-sorting | **Date**: 2026-10-07

Validation/run guide. Contract: [contracts/sort-control.md](contracts/sort-control.md); state and
order semantics: [data-model.md](data-model.md).

## Prerequisites

Same as features 001/002 — Node 20 LTS, `npm ci`, Playwright Chromium. No new dependencies.

## Run

```powershell
npm run dev            # http://localhost:3000/episodes/
npm run build          # static export → out/
npm run preview        # serve out/ for e2e / Lighthouse
```

## Gates

```powershell
npm run lint
npm test               # + sort.test.ts, EpisodeCatalog.test.tsx
npm run build
npm run validate:html
npm run check:links
npm run test:e2e       # + sorting.spec.ts; a11y/responsive gain a sorted variant
npm run lhci           # /episodes/ perf ≥ 90, a11y ≥ 90 (SC-006)
```

## Validation scenarios

| # | Scenario | Steps | Expected | Spec |
|---|----------|-------|----------|------|
| 1 | Default | Fresh profile → `/episodes/` | Newest first; select shows "Newest first" | FR-006, US1-AC1 |
| 2 | Oldest | Choose "Oldest first" | Ep. 1 first, Ep. 20 last; no reload; "Sorted by Oldest first" announced | FR-002/004/005, US1-AC2/AC5 |
| 3 | Title A–Z / Z–A | Choose each | Titles alphabetical (case-insensitive) asc / desc | US1-AC3 |
| 4 | Shortest / Longest | Choose each | Durations ascending / descending | US1-AC4 |
| 5 | Works in List view | Switch to List, change sort | Still List; only order changes | US1-AC6, FR-013 |
| 6 | Persist, no re-shuffle | Choose "Oldest first" → reload | Ep. 1 is already first at first paint; select shows "Oldest first" | FR-007/008, US2-AC1, SC-003 |
| 7 | Cross-session / navigation | Go to `/` and back; reopen browser | Same order | US2-AC2 |
| 8 | Reset | Choose "Newest first" | `localStorage.episodeSort === "newest"`; later loads newest | US2-AC3 |
| 9 | Invalid value | `localStorage.episodeSort = "banana"` → reload | Newest first; no error | FR-011 |
| 10 | Independence | List + Longest → reload → switch to Card → change sort | Both persist; each control changes only its own aspect | US3-AC1/AC2, SC-004 |
| 11 | No JavaScript | Playwright `no-js` project | Newest first; sort control hidden; view switcher hidden | FR-009 |
| 12 | Keyboard | Tab to select, ArrowDown, Enter | Order changes; focus remains on select with visible ring | FR-010 |
| 13 | Toolbar responsive | 320/768/1280/1920 px | Heading, view switcher, sort control visible; no horizontal overflow | FR-012, US3-AC3 |
| 14 | Accessibility | axe on `/episodes/` with `title-asc`, light + dark | 0 violations | SC-005 |
| 15 | Focus order matches | After choosing "Oldest first", Tab through cards | Focus visits Ep. 1, Ep. 2, … in visual order | research R2 |

## Troubleshooting

- **Episodes re-shuffle visibly on reload**: rank variables missing from `<li>` or the
  `html[data-sort]` CSS rules absent; check `rankStyle` usage in `EpisodeCatalog` and the five
  rules in `page.module.css`.
- **Focus order doesn't match visual order**: `EpisodeCatalog` is not re-rendering children in
  sorted order after hydration (CSS `order` alone is not sufficient).
- **Select visible without JS**: missing `html.no-js .sort-control { display:none }` or the
  wrapper lacks the `sort-control` global class.
- **Accented titles misplaced**: collator must use `sensitivity: "base"`.
