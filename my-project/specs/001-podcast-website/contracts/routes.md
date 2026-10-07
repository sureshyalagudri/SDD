# Contract: Routes & Page Requirements

**Feature**: 001-podcast-website | **Date**: 2026-10-07

All routes are statically exported with `trailingSlash: true`. Every page shares the root
layout: `<header>` with site name, primary `<nav>` (Home, Episodes, About, FAQ) and
`ThemeToggle`; `<main>` with exactly one `<h1>`; `<footer>`.

| URL | Source | Required elements | Spec refs |
|-----|--------|-------------------|-----------|
| `/` | `app/page.tsx` | Hero (`<section aria-labelledby>`) for the featured episode: artwork `<img>`, `<h1>` title, short description, duration, publish date (`<time datetime>`), primary CTA link to `/episodes/<slug>/`; "Listen on" section with ≥ 3 platform badges | FR-002, FR-015, US1 |
| `/episodes/` | `app/episodes/page.tsx` | `<h1>`; `<ul>` of exactly 20 `<li>` cards, newest first; each card: artwork, episode number, title (link to detail), short description, duration, `<time>`; single column at ≤ 480 px | FR-003, US2 |
| `/episodes/<slug>/` | `app/episodes/[slug]/page.tsx` | `<h1>` title; episode number; artwork; `<time>`; duration; full description; `AudioPlayer` (native `<audio controls preload="none">` in SSR HTML); "Listen on" section; link back to `/episodes/` | FR-004, FR-013, FR-015 |
| `/about/` | `app/about/page.tsx` | `<h1>`; three `<section>`s with headings: Introduction, Host (photo `<img alt>`, name, bio), Mission | FR-005, US3 |
| `/faq/` | `app/faq/page.tsx` | `<h1>`; ≥ 6 `<details>` items, none with `open` by default; each `<summary>` is the question | FR-006, US4 |
| `/404.html` (any unknown path) | `app/not-found.tsx` | `<h1>`; branded message; link to `/` | FR-011 |

## Cross-cutting contracts

- **Theme**: `<html>` carries `data-theme="light|dark"` once a choice exists; otherwise absent and
  CSS follows `prefers-color-scheme`. `<html class="no-js">` is present in SSR HTML and removed
  by the inline head script; `.no-js .theme-toggle { display: none }`. (FR-014)
- **Navigation**: all nav links are `<a href>` (no JS routing dependency for first load);
  current page link has `aria-current="page"`. (FR-001, FR-009)
- **Focus**: every interactive element has a visible `:focus-visible` outline ≥ 2 px with AA
  contrast in both themes. (FR-010)
- **Images**: every `<img>` has `alt`, `width`, `height`; below-the-fold images use
  `loading="lazy"`. (FR-010, Principle III)
- **Responsiveness**: no horizontal overflow at 320, 768, 1280, 1920 px. (FR-008, SC-004)
- **External links**: only platform `homeUrl`s; `rel="noopener"`, `target="_blank"`, and
  visually/verbally indicated as external. (FR-015)
