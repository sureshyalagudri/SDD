# Implementation Plan: Modern Podcast Website

**Branch**: `001-podcast-website` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-podcast-website/spec.md`

## Summary

Build a fully static, responsive podcast website (Landing with featured-episode hero, Episodes
catalog of 20, 20 episode detail pages, About, FAQ, 404) using Next.js App Router in static
export mode (`output: 'export'`). All content (podcast, host, 20 episodes, FAQ) is embedded as
typed TypeScript data in the repository; no database, API, or external feed. Progressive
enhancement is mandatory: HTML renders all core content at build time, FAQ uses native
`<details>`, audio uses a native `<audio>` element enhanced by a custom player, and the
light/dark theme follows `prefers-color-scheme` until a JS toggle stores a choice.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (build-time only; no runtime server)

**Primary Dependencies**: Next.js 15.x (App Router, `output: 'export'`), React 19; CSS Modules +
CSS custom properties (no CSS framework); `next/font/local` with committed WOFF2 files

**Storage**: N/A — content embedded as TypeScript modules under `content/`; static assets
(artwork SVGs, 20 short MP3 placeholder clips, platform badge SVGs) committed under `public/`

**Testing**: Vitest + React Testing Library (unit/content validation); Playwright (e2e incl.
keyboard-only, JS-disabled, and viewport matrix); Lighthouse CI (`@lhci/cli`) for Performance/
Accessibility ≥ 90 and JS budget; `html-validate` on `out/`; `linkinator` for broken links

**Target Platform**: Any static host/CDN over HTTPS; latest two versions of Chrome, Edge,
Firefox, Safari (desktop + mobile)

**Project Type**: static web application (single Next.js project at repo root)

**Performance Goals**: ≤ 200 KB compressed JS per page; Lighthouse mobile (slow-4G profile)
Performance ≥ 90 and Accessibility ≥ 90 on every page; Time to Interactive < 2 s on a typical
4G mobile profile (Lighthouse simulated 70 ms RTT / 9 Mbps / 4× CPU) — SC-003's "typical mobile
connection"

**Constraints**: static files only (`out/`); core content and navigation render with JS disabled;
WCAG 2.1 AA contrast in both themes; no build-time network fetches (fonts/assets committed);
HTML validates with zero errors; all links resolve

**Scale/Scope**: 25 generated pages (Landing, Episodes, About, FAQ, 20 episode pages, 404);
20 episodes × (artwork + audio clip); ~8 UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Evidence |
|------------------------|--------|----------|
| I. Static-First | PASS | `output: 'export'` emits plain HTML/CSS/JS to `out/`; no server runtime, no API routes, no ISR/SSR |
| II. Accessibility & Semantic HTML | PASS | Landmarks (`header/nav/main/footer`), ordered headings, `<details>/<summary>` FAQ, `alt` on artwork, visible focus styles, AA contrast verified per theme via Lighthouse + axe in Playwright |
| III. Performance Budget | PASS (verify post-build) | Next.js 15 App Router baseline ≈ 100 KB gz first-load JS; only client components are ThemeToggle and AudioPlayer; Lighthouse CI budget asserts script ≤ 200 KB; artwork as SVG, audio `preload="none"` |
| IV. Content & Asset Integrity | PASS | All content/assets committed; `next/font/local` (no Google Fonts fetch at build); `linkinator` gate on `out/`; `npm ci && npm run build` reproducible |
| V. Simplicity | JUSTIFIED | Next.js is a framework and MUST be justified → see Complexity Tracking. No CSS framework, no state library, no CMS |
| Static publish dir | PASS | `out/` |
| HTML validates | PASS (gate) | `html-validate out/**/*.html` in CI |
| Works without JS | PASS | Build-time HTML includes all content; FAQ via `<details>`; audio via native `<audio controls>`; theme via `prefers-color-scheme` CSS fallback |
| HTTPS / no mixed content | PASS | All assets same-origin relative paths; host provides TLS |
| No secrets | PASS | No env vars or tokens required |
| Evergreen browsers | PASS | Next.js default browserslist; no legacy polyfills |

**Pre-research gate result**: PASS (one justified deviation recorded below).

## Project Structure

### Documentation (this feature)

```text
specs/001-podcast-website/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── routes.md        # Page/URL contract and required elements per page
│   └── content-schema.md# Typed content contract for embedded mock data
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx             # Root layout: html[data-theme], header/nav, footer, fonts
│   ├── page.tsx               # Landing (featured episode hero + Listen On)
│   ├── not-found.tsx          # Branded 404 → exported as out/404.html
│   ├── globals.css            # Tokens (light/dark), reset, typography, focus styles
│   ├── episodes/
│   │   ├── page.tsx           # Episodes catalog (20, newest first)
│   │   └── [slug]/page.tsx    # Episode detail (generateStaticParams over content)
│   ├── about/page.tsx
│   └── faq/page.tsx
├── components/
│   ├── SiteHeader.tsx         # nav + ThemeToggle slot
│   ├── SiteFooter.tsx
│   ├── NavLinks.tsx           # client; aria-current via usePathname
│   ├── ThemeToggle.tsx        # client component; hidden when JS unavailable
│   ├── EpisodeHero.tsx
│   ├── EpisodeCard.tsx
│   ├── AudioPlayer.tsx        # client component wrapping native <audio>
│   ├── ListenOn.tsx           # platform badges
│   └── FaqList.tsx            # <details>/<summary> items
├── content/
│   ├── podcast.ts             # name, tagline, intro, mission
│   ├── host.ts
│   ├── episodes.ts            # 20 episodes, exactly one featured
│   ├── faq.ts
│   └── platforms.ts           # Listen-on platforms (name, badge, home URL)
├── lib/
│   ├── types.ts               # Content types (see contracts/content-schema.md)
│   ├── episodes.ts            # getAllEpisodes (sorted), getEpisodeBySlug, getFeaturedEpisode
│   ├── fonts.ts               # next/font/local (committed WOFF2)
│   └── theme.ts               # theme init script string + storage key
├── tests/
│   ├── unit/                  # content invariants, lib helpers, component rendering
│   └── e2e/                   # Playwright: journeys, keyboard, no-JS, viewports, axe
└── test-results/              # generated (git-ignored): Playwright + Lighthouse output

public/                        # must stay at root: Next.js serves static assets from here
├── artwork/ep-01.svg … ep-20.svg
├── audio/ep-01.mp3 … ep-20.mp3   # short generated placeholder clips
├── badges/*.svg
├── fonts/*.woff2
└── host.svg

scripts/                       # dev tooling, not app code
├── generate-artwork.mjs
├── generate-placeholder-audio.mjs
└── check-links.mjs

next.config.ts                 # output:'export', trailingSlash:true, images.unoptimized:true
lighthouserc.json              # ≥90 perf/a11y, script budget 200 KB
playwright.config.ts
vitest.config.ts
package.json
```

**Structure Decision**: Single Next.js project with application code under `src/` (`app/`,
`components/`, `content/`, `lib/`, `tests/`); the `@/*` alias maps to `src/*`. `public/` stays at
the repository root because Next.js only serves static assets from there, and `scripts/` stays at
the root as build-time tooling. Generated test output goes to `src/test-results/` (ignored). The
static build output `out/` is the sole deployable artifact.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Next.js framework (Principle V: framework MUST be justified) | Explicit user requirement; generates 20 episode pages + shared layout from a single typed data source; `output: 'export'` yields plain static files satisfying Principle I; built-in routing, 404 export, and font self-hosting | Hand-written HTML for 25 pages duplicates layout/nav and makes the 20 episode pages error-prone to keep consistent; a lighter SSG (e.g., Eleventy/Astro) would be simpler but contradicts the stated stack choice and offers no material benefit for this scope |

## Post-Design Constitution Re-check

Re-evaluated after Phase 1 (research.md, data-model.md, contracts/, quickstart.md):

- Static-First: unchanged — no server features introduced by design; `generateStaticParams`
  covers all 20 slugs.
- Performance: client JS limited to `ThemeToggle`, `AudioPlayer`, and the small `NavLinks`
  (`usePathname` for `aria-current`) on top of the framework baseline; audio `preload="none"`,
  SVG artwork, global CSS inlined, above-fold artwork preloaded, `Link` prefetch disabled →
  budget holds (113 kB max first-load JS). Measured: slow-4G TTI 2.06–2.17 s (perf 97–99);
  typical-4G TTI ≈ 0.8 s, satisfying SC-003. Both profiles are CI gates (`npm run lhci`).
- Simplicity: CSS Modules + custom properties chosen over Tailwind/styled-components (see
  research.md); no additional runtime dependencies beyond Next/React.
- Content integrity: content invariants (20 episodes, 1 featured, unique slugs, assets exist)
  enforced by a unit test; fonts committed.

**Post-design gate result**: PASS.
