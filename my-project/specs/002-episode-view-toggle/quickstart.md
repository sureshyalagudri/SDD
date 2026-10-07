# Quickstart: Episode List & Card (Grid) View Toggle

**Feature**: 002-episode-view-toggle | **Date**: 2026-10-07

Validation/run guide for the view switcher. Implementation detail lives in `tasks.md`; contract
in [contracts/view-switcher.md](contracts/view-switcher.md); state model in
[data-model.md](data-model.md).

## Prerequisites

Same as feature 001 — Node 20 LTS, `npm ci`, Playwright Chromium installed. No new dependencies.

## Run

```powershell
npm run dev            # http://localhost:3000/episodes/
npm run build          # static export → out/
npm run preview        # serve out/ for e2e / Lighthouse
```

## Gates (all must stay green)

```powershell
npm run lint
npm test               # + ViewSwitcher unit test
npm run build
npm run validate:html
npm run check:links
npm run test:e2e       # + view-toggle.spec.ts; a11y/responsive specs gain a List-view variant
npm run lhci           # /episodes/ already audited: perf ≥ 90, a11y ≥ 90 (SC-006)
```

## Validation scenarios

| # | Scenario | Steps | Expected | Spec |
|---|----------|-------|----------|------|
| 1 | Default | Open `/episodes/` in a fresh profile | Card grid; switcher shows **Card** pressed | FR-006, US1-AC1 |
| 2 | Switch to List | Press **List** | Same 20 episodes re-lay out as rows, same order, no reload; **List** pressed; screen reader hears "List view selected" | FR-002–004, US1-AC2/AC4 |
| 3 | Row links | In List view select a title | Navigates to `/episodes/<slug>/` | US1-AC3, FR-013 |
| 4 | Persist | Choose List → reload | List view on first paint, no Card flash | FR-007/008, US2-AC1, SC-003 |
| 5 | Cross-session | Close browser, reopen `/episodes/` | Still List | US2-AC2 |
| 6 | Reset | Press **Card**; reload | Card; `localStorage.episodeView === "card"` | US2-AC3 |
| 7 | Invalid value | Set `localStorage.episodeView = "banana"`; reload | Card view; no console error | FR-012 |
| 8 | No JavaScript | Playwright `no-js` project (or DevTools) | Card grid rendered; switcher not visible | FR-009 |
| 9 | Keyboard | Tab to switcher, Enter on **List** | View switches; focus ring visible | FR-010 |
| 10 | Responsive List | List view at 320/768/1280/1920 px | No horizontal overflow; each row shows thumbnail, number, title, duration, date; long titles wrap | FR-011, US3 |
| 11 | Density | 1280×800, count items in first viewport in each view | List ≥ 2 × Card | SC-004 |
| 12 | Accessibility | axe on `/episodes/` in List view, light + dark | 0 violations | FR-010, SC-005 |
| 13 | Theme independence | Toggle theme while in List view | View unchanged; both preferences persist | Assumptions |

## Troubleshooting

- **Card view flashes before List on reload**: the `viewInitScript` is not included in the
  inline `<head>` script or runs after stylesheets — check `src/app/layout.tsx`.
- **Switcher visible without JS**: missing `html.no-js .view-switcher { display: none }` in
  `src/app/globals.css`, or the component lacks the `view-switcher` global class.
- **Rows overflow at 320 px**: `.meta` must stack under the title below 480 px; check the
  `:global(html[data-view="list"])` block in `EpisodeCard.module.css`.
