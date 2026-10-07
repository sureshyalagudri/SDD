# Quickstart: Modern Podcast Website

**Feature**: 001-podcast-website | **Date**: 2026-10-07

Validation/run guide. Implementation details belong in `tasks.md`; contracts are in
[contracts/](contracts/) and the data model in [data-model.md](data-model.md).

## Prerequisites

- Node.js 20 LTS, npm 10+
- No environment variables, accounts, or network services required
- Playwright browsers: `npx playwright install --with-deps` (first run only)

## Setup & run

```powershell
npm ci                 # install from lockfile (reproducible)
npm run dev            # http://localhost:3000 with hot reload
npm run build          # next build → static site in out/
npm run preview        # serve out/ locally (e.g., npx serve out) for e2e/Lighthouse
```

Expected: `out/` contains `index.html`, `episodes/index.html`, 20 `episodes/<slug>/index.html`,
`about/index.html`, `faq/index.html`, `404.html`, plus `_next/`, `artwork/`, `audio/`,
`badges/`, `fonts/`.

## Quality gates (all must pass; mirrors constitution Development Workflow)

```powershell
npm run test            # Vitest: content invariants + lib + component tests
npm run build           # must succeed from clean checkout
npm run validate:html   # html-validate out/**/*.html → 0 errors
npm run check:links     # linkinator out/ → 0 broken links (internal + platform home URLs)
npm run test:e2e        # Playwright journeys, keyboard, no-JS, viewports, axe
npm run lhci            # Lighthouse CI: slow-4G perf ≥ 90, a11y ≥ 90, script ≤ 200 KB; typical-4G TTI ≤ 2 s
```

## Validation scenarios

| # | Scenario | Steps | Expected | Spec |
|---|----------|-------|----------|------|
| 1 | Featured hero | Open `/` | One hero with artwork, title, description, duration, date; CTA navigates to `/episodes/<featured-slug>/` | US1, FR-002 |
| 2 | Catalog | Open `/episodes/` | Exactly 20 cards, newest first, each with artwork/number/title/description/duration/date | US2, FR-003 |
| 3 | Episode page | Click any card | URL is `/episodes/<slug>/`; full description; player present; "Listen on" badges | FR-004, FR-015 |
| 4 | Playback | On an episode page press Play, then Pause, then drag seek | Audio plays from that episode's own clip; pause stops; seek changes current time | FR-013 |
| 5 | About | Open `/about/` | Introduction, Host (photo+bio), Mission sections visible | US3, FR-005 |
| 6 | FAQ | Open `/faq/`; press Tab to a question; press Enter | ≥ 6 items all collapsed on load; Enter reveals answer; Enter again collapses | US4, FR-006 |
| 7 | No JavaScript | Run Playwright `no-js` project (or disable JS in DevTools) over all pages | All content/nav present; FAQ still expands; native audio controls visible; theme toggle hidden; theme follows system | FR-009 |
| 8 | Theme toggle | Click toggle → reload → open another page | Chosen theme persists with no flash; both themes pass axe contrast | FR-014, SC-007 |
| 9 | Responsive | Set viewport 320, 768, 1280, 1920 px on every page | No horizontal scrollbar; episodes single-column at 320 | FR-008, SC-004 |
| 10 | Keyboard only | Tab through each page | Every link/button/toggle/player control reachable with visible focus | FR-010, SC-005 |
| 11 | 404 | Open `/does-not-exist/` on the preview server | Branded not-found page with link to `/` | FR-011 |
| 12 | Budget | Inspect `lhci` reports in `src/test-results/lighthouse*/` | Slow-4G: Performance ≥ 90, Accessibility ≥ 90, script ≤ 200 KB; typical-4G: TTI ≤ 2 s per page | SC-003, Principle III |

## Troubleshooting

- **Build fails on content test**: a content invariant in
  [contracts/content-schema.md](contracts/content-schema.md) is violated (e.g., two featured
  episodes or a missing `/audio/ep-NN.mp3`).
- **Lighthouse script budget exceeded**: check that only `ThemeToggle` and `AudioPlayer` are
  client components (`'use client'`); everything else must stay server components.
- **Theme flashes on reload**: confirm the inline head script runs before stylesheets and sets
  `data-theme` on `<html>`.
