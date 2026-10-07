# Research: Modern Podcast Website

**Feature**: 001-podcast-website | **Date**: 2026-10-07

All Technical Context items were resolvable from the user's stated stack (Next.js static export,
embedded mock data, responsive) plus the constitution. No `NEEDS CLARIFICATION` remain.

## R1. Static generation with Next.js

- **Decision**: Next.js 15 App Router with `output: 'export'`, `trailingSlash: true`,
  `images: { unoptimized: true }`. Episode pages generated via `generateStaticParams()` from
  `content/episodes.ts`. `app/not-found.tsx` is exported as `out/404.html`.
- **Rationale**: User-mandated stack. Static export produces plain HTML/CSS/JS (Principle I).
  `trailingSlash` yields `/episodes/index.html`-style output that every static host serves
  without rewrite rules. `unoptimized` is required because the Next image optimizer needs a
  server.
- **Alternatives considered**: Pages Router (older, no layouts); SSR/ISR (violates Static-First);
  Astro/Eleventy (simpler but contradicts stated stack).

## R2. Styling approach

- **Decision**: Global CSS custom-property design tokens in `app/globals.css` + CSS Modules per
  component. No Tailwind, no CSS-in-JS runtime.
- **Rationale**: Principle V (prefer plain CSS); zero runtime cost; tokens make light/dark
  theming a single `[data-theme]` switch; CSS Modules ship only used styles.
- **Alternatives considered**: Tailwind (extra toolchain, utility noise for ~8 components);
  styled-components/Emotion (runtime JS, hurts budget and SSR complexity).

## R3. Light/dark theme with persisted toggle and no flash

- **Decision**: `<html data-theme="light|dark">` drives tokens. CSS default uses
  `@media (prefers-color-scheme: dark)` when `data-theme` is absent. A tiny inline, blocking
  script in `<head>` (via `<script dangerouslySetInnerHTML>` in `layout.tsx`) reads
  `localStorage['theme']` and sets `data-theme` before first paint, and removes a `no-js`
  class from `<html>`. `ThemeToggle` is a client component that updates the attribute and
  storage; CSS hides it under `html.no-js`.
- **Rationale**: Satisfies FR-014 (toggle + persistence + system default), the "no flash"
  edge case, and the JS-disabled fallback. Inline script is < 300 bytes.
- **Alternatives considered**: `next-themes` package (adds a dependency for ~20 lines of code);
  cookie-based theme (needs server to read cookie — not static).

## R4. FAQ expand/collapse without JavaScript

- **Decision**: Native `<details>`/`<summary>` per FAQ item, styled with CSS; collapsed by
  default (no `open` attribute).
- **Rationale**: FR-006 requires collapse/expand to work without JS; `<details>` is
  keyboard-operable and announced correctly by screen readers with zero script.
- **Alternatives considered**: ARIA accordion with React state (breaks without JS); always-open
  list (rejected in clarification).

## R5. Audio playback with placeholder clips

- **Decision**: `AudioPlayer` client component renders a native
  `<audio controls preload="none" src=...>` in server HTML; when hydrated it hides native
  controls and shows a custom play/pause button, seek slider (`<input type="range">`), and
  elapsed/total time bound to the audio element's events. 20 distinct short clips
  (`public/audio/ep-NN.mp3`, ~8 s each, ≈ 60–120 KB) generated once by
  `scripts/generate-placeholder-audio.mjs` and committed.
- **Rationale**: FR-013 (real playback, play/pause/seek, one clip per episode); native element
  gives JS-disabled fallback; `preload="none"` keeps audio out of the page-load budget. MP3 is
  universally supported in evergreen browsers.
- **Alternatives considered**: Third-party player libs (budget/dependency cost); WAV
  (10× larger); a single shared clip (rejected in clarification).

## R6. Fonts

- **Decision**: One variable sans-serif WOFF2 (open-license) committed to `public/fonts/` and
  loaded through `next/font/local` with `display: 'swap'`.
- **Rationale**: Principle IV forbids build-time fetching of unversioned inputs;
  `next/font/google` downloads at build. Self-hosting also avoids third-party requests.
- **Alternatives considered**: System font stack (zero cost but weaker "premium" identity);
  Google Fonts (build-time fetch; third-party origin).

## R7. Artwork and imagery

- **Decision**: 20 episode artworks as generated SVGs (gradient + episode number +
  monogram) in `public/artwork/` via `scripts/generate-artwork.mjs` (output committed); host
  portrait as a single illustrated SVG avatar `public/host.svg` (~1 KB); platform badges as SVG.
  Rendered with plain `<img>` and explicit `width`/`height`; `loading="lazy"` for below-the-fold
  cards.
- **Rationale**: SVG is tiny, crisp at any DPR, and trivially distinct per episode; explicit
  dimensions prevent layout shift (Performance ≥ 90); no image optimizer needed.
- **Alternatives considered**: Raster placeholders (larger, need multiple sizes);
  `next/image` (requires server or custom loader under export).

## R8. Routing and URLs

- **Decision**: `/`, `/episodes/`, `/episodes/<slug>/`, `/about/`, `/faq/`, `/404.html`.
  Slug = `ep-NN-kebab-title` (e.g., `/episodes/ep-07-the-art-of-listening/`), unique per
  episode, defined in content.
- **Rationale**: FR-004 requires a shareable URL per episode; slug includes number for stable
  ordering and title for readability.
- **Alternatives considered**: `/episodes/7/` (less descriptive); title-only slug (collision
  risk).

## R9. Testing and quality gates

- **Decision**:
  - Vitest + React Testing Library: content invariants (exactly 20 episodes, exactly one
    featured, unique numbers/slugs, referenced assets exist, ≥ 6 FAQ, ≥ 3 platforms), `lib/`
    helpers, component rendering.
  - Playwright against `out/` served statically: user-story journeys, keyboard-only
    navigation, `javaScriptEnabled: false` project, viewport matrix (320/768/1280/1920),
    `@axe-core/playwright` for AA checks in both themes, theme persistence across reload.
  - Lighthouse CI (`@lhci/cli`) in two passes chained by `npm run lhci`: `lighthouserc.json`
    (default slow-4G mobile) asserts `categories:performance ≥ 0.9`,
    `categories:accessibility ≥ 0.9`, and `resource-summary:script:size ≤ 200000`;
    `lighthouserc.typical-4g.json` (simulated 70 ms RTT / 9 Mbps / 4× CPU) asserts
    `interactive ≤ 2000 ms` for SC-003. Slow-4G TTI measures 2.06–2.17 s — bounded by the
    ~103 kB React/Next runtime — so "typical mobile connection" is pinned to the typical-4G
    profile rather than the 75th-percentile slow-4G one.
  - `html-validate` over `out/**/*.html` (style-only rules for React's void-tag/camelCase
    serialization disabled; structural rules on); link check via `scripts/check-links.mjs`,
    which serves `out/` locally and crawls it with the linkinator API (the linkinator CLI's
    directory glob fails on Windows), including external platform links.
- **Rationale**: Directly maps to constitution Development Workflow gates and spec SC-003/004/
  005/007.
- **Alternatives considered**: Cypress (heavier; Playwright has first-class no-JS mode); manual
  Lighthouse (not enforceable).

## R10. Hosting

- **Decision**: Hosting-agnostic. `out/` is deployable to any static host (GitHub Pages,
  Netlify, Vercel static, Azure Static Web Apps, S3+CloudFront). HTTPS is provided by the host.
  No host-specific config is part of this feature.
- **Rationale**: Spec is scoped to the site, not deployment; constitution only requires static
  output and HTTPS.
- **Alternatives considered**: Committing to one provider now (premature).
