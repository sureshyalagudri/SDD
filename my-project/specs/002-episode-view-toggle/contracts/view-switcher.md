# Contract: View Switcher & Catalog Layouts

**Feature**: 002-episode-view-toggle | **Date**: 2026-10-07

## Bootstrap (inline `<head>` script, `src/lib/view.ts`)

```text
read  localStorage["episodeView"]
if value ∈ {"card","list"}  → document.documentElement.dataset.view = value
else                         → leave attribute absent (Card styling)
```

Runs in the same inline script as the theme bootstrap, before any stylesheet is applied.
Must stay ≤ ~150 bytes minified and be wrapped in `try/catch`.

## `ViewSwitcher` (client component, `src/components/ViewSwitcher.tsx`)

**Placement**: `/episodes/` only, directly above the catalog `<ul aria-label="All episodes">`,
right-aligned within the page header row.

**Markup contract**

```html
<div class="view-switcher …" role="group" aria-label="Catalog view">
  <button type="button" aria-pressed="true|false">
    <svg aria-hidden="true" …/> <span>Card</span>
  </button>
  <button type="button" aria-pressed="true|false">
    <svg aria-hidden="true" …/> <span>List</span>
  </button>
  <span class="visually-hidden" aria-live="polite">Card view selected</span>
</div>
```

**Behaviour**

| Event | Effect |
|-------|--------|
| mount | `aria-pressed` derived from `html[data-view]` (absent ⇒ Card pressed) |
| press "List" | `html[data-view="list"]`; `localStorage.episodeView = "list"` (best effort); live region → "List view selected" |
| press "Card" | `html[data-view="card"]`; `localStorage.episodeView = "card"`; live region → "Card view selected" |
| press already-active option | no-op (state unchanged, no announcement) |
| JavaScript disabled | component never hydrates; `html.no-js .view-switcher { display: none }` hides the SSR markup |

**Accessibility**: both buttons reachable by Tab; activate with Enter/Space; visible
`:focus-visible` outline (inherits global rule); pressed state has ≥ 3:1 contrast against
unpressed in both themes; text labels always visible (icons are decorative).

## Catalog layouts (CSS, no markup change)

| Selector context | Card view (default / `data-view="card"`) | List view (`html[data-view="list"]`) |
|------------------|------------------------------------------|--------------------------------------|
| `.grid` (`src/app/episodes/page.module.css`) | 1 col < 481 px, 2 cols 481–959 px, 3 cols ≥ 960 px; `gap: 1.5rem` | single column; `gap: 0`; rows separated by `border-bottom: 1px solid var(--border)` |
| `.card` (`src/components/EpisodeCard.module.css`) | vertical: artwork on top, body below; bordered, rounded, hover lift | horizontal grid: `64px auto 1fr auto` → thumbnail · "Ep. NN" · title (+ description ≥ 960 px) · meta; no border/radius/shadow; hover tints background |
| `.art` | full width, `aspect-ratio: 1` | `64px × 64px`, `border-radius: var(--radius-sm)` |
| `.desc` | 3-line clamp | hidden < 960 px; 1-line clamp ≥ 960 px |
| `.meta` | wraps under description | right-aligned column; stacks under title < 480 px |
| `.titleLink::after` (stretched link) | covers card | covers row |

**Invariants (both views)**: same 20 `<li>` in the same DOM order; each `<li>` contains exactly
one `<h3>` with one `<a href="/episodes/<slug>/">`; `<img>` keeps `width`/`height`/`alt=""`;
no element exceeds the viewport width at 320/768/1280/1920 px.

## Density target (SC-004)

At 1280 × 800 px: Card view shows ≈ 3–6 items in the first viewport; List view must show ≥ 2×
that count (row height ≤ 80 px ⇒ ≥ 8 rows visible below the header).
