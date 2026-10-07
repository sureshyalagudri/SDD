# Tasks: Modern Podcast Website

**Input**: Design documents from `/specs/001-podcast-website/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md,
contracts/content-schema.md, quickstart.md

**Tests**: Included. The constitution's Development Workflow mandates build, HTML validation,
broken-link, Lighthouse, and keyboard/no-JS gates, and the plan defines Vitest/Playwright/LHCI
as the enforcement stack. Test tasks are therefore required, written as gates alongside (not
strictly before) implementation.

**Organization**: Tasks are grouped by user story so each story is an independently testable
increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1–US4) — required only in user-story phases
- Every task names exact file paths

## Path Conventions

Single Next.js project at repository root (see plan.md): `app/`, `components/`, `content/`,
`lib/`, `public/`, `scripts/`, `tests/unit/`, `tests/e2e/`. Static output in `out/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js static-export project, tooling, and quality-gate configs.

- [X] T001 Initialize Next.js 15 + TypeScript project at repo root: create `package.json` (name, `"private": true`, `"type": "module"`), install `next@15`, `react@19`, `react-dom@19`, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`; add scripts `dev`, `build`, `preview` (`npx serve out -l 3000`), `lint`, `test`, `test:e2e`, `validate:html`, `check:links`, `lhci`
- [X] T002 Create `next.config.ts` with `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }`, `reactStrictMode: true`
- [X] T003 [P] Create `tsconfig.json` (strict, `paths` alias `@/*` → `./*`, `jsx: preserve`, Next plugin) and `next-env.d.ts`
- [X] T004 [P] Configure ESLint with `eslint-config-next` + `eslint-plugin-jsx-a11y` in `eslint.config.mjs`; add Prettier config `.prettierrc`
- [X] T005 [P] Install and configure Vitest + React Testing Library: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`; create `vitest.config.ts` (environment jsdom, include `tests/unit/**/*.test.ts?(x)`, setup file `tests/unit/setup.ts`)
- [X] T006 [P] Install and configure Playwright: `@playwright/test`, `@axe-core/playwright`; create `playwright.config.ts` with `webServer` serving `out/` on port 3000, projects `chromium`, `mobile` (320×640 viewport), and `no-js` (`javaScriptEnabled: false`); tests in `tests/e2e/`
- [X] T007 [P] Install `@lhci/cli` and create `lighthouserc.json`: `collect.staticDistDir: "out"`, `collect.url` for `/`, `/episodes/`, `/episodes/ep-01-*/`, `/about/`, `/faq/`; assertions `categories:performance >= 0.9`, `categories:accessibility >= 0.9`, `resource-summary:script:size <= 200000` (mobile preset)
- [X] T008 [P] Install `html-validate` and `linkinator`; create `.htmlvalidate.json` (extends `html-validate:recommended`); wire `validate:html` → `html-validate "out/**/*.html"` and `check:links` → `linkinator out --recurse --server-root out --skip "_next/"` in `package.json`
- [X] T009 [P] Create `.gitignore` (`node_modules/`, `.next/`, `out/`, `playwright-report/`, `test-results/`, `.lighthouseci/`) and `.editorconfig`
- [X] T010 [P] Create directory skeleton with `.gitkeep` where empty: `app/`, `components/`, `content/`, `lib/`, `public/artwork/`, `public/audio/`, `public/badges/`, `public/fonts/`, `scripts/`, `tests/unit/`, `tests/e2e/`

**Checkpoint**: `npm run dev` starts, `npm run build` produces an (empty) `out/`, all gate
commands execute (and may report nothing yet).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, content, design tokens, theme system, layout, and content
invariants that every page depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Types & content (data-model.md, contracts/content-schema.md)

- [X] T011 Create `lib/types.ts` exporting `Podcast`, `Host`, `Episode`, `FaqItem`, `Platform` exactly as in contracts/content-schema.md (field names, types, comments on constraints)
- [X] T012 [P] Create `content/podcast.ts` exporting `podcast: Podcast` — fictional show; `name` 1–60 chars, `tagline` ≤ 120 chars, non-empty `introduction` and `mission`
- [X] T013 [P] Create `content/platforms.ts` exporting `platforms: readonly Platform[]` with ≥ 3 entries (`apple`, `spotify`, `rss` at minimum); each `homeUrl` is an `https://` platform **home page** (never a show page); `badgeSrc` = `/badges/{id}.svg`
- [X] T014 [P] Create platform badge SVGs `public/badges/apple.svg`, `public/badges/spotify.svg`, `public/badges/rss.svg` (generic monochrome glyph + wordmark text, `viewBox` set, no external refs)
- [X] T015 Create `content/episodes.ts` exporting `episodes: readonly Episode[]` with exactly 20 entries: `number` 1–20 contiguous; `slug` unique matching `^ep-\d{2}-[a-z0-9-]+$`; `title` 1–90 chars; `shortDescription` ≤ 160 chars; multi-paragraph `fullDescription`; `artworkSrc` = `/artwork/ep-NN.svg`; non-empty `artworkAlt`; `durationSeconds` > 0; unique ISO `publishedAt` dates; `audioSrc` = `/audio/ep-NN.mp3` (distinct); exactly one `featured: true`
- [X] T016 [P] Create 20 episode artwork SVGs `public/artwork/ep-01.svg` … `public/artwork/ep-20.svg` (1:1 `viewBox="0 0 600 600"`, distinct gradient per episode, large episode number, podcast monogram; no external refs, ≤ 4 KB each)
- [X] T017 [P] Create `scripts/generate-placeholder-audio.mjs` that synthesizes 20 distinct ~8-second MP3 clips (different tone/pitch per episode) to `public/audio/ep-01.mp3` … `ep-20.mp3` using a pure-JS encoder (e.g., `lamejs` as a devDependency); add `npm run generate:audio`; run it once and commit the 20 files (target ≤ 120 KB each)
- [X] T018 Create `lib/episodes.ts` exporting `getAllEpisodes()` (sort `publishedAt` desc, tie-break `number` desc), `getFeaturedEpisode()` (throws if count ≠ 1), `getEpisodeBySlug(slug)`, `formatDuration(seconds)` (`m:ss` under 1 h else `h:mm:ss`), `formatDate(iso)` (long-form, `en-US`)
- [X] T019 [P] Write `tests/unit/content.test.ts` enforcing all six invariants from contracts/content-schema.md (20 episodes, numbers 1..20, slug pattern/uniqueness, exactly one featured, every `artworkSrc`/`audioSrc`/`badgeSrc`/`photoSrc` exists under `public/` via `fs.existsSync`, distinct `audioSrc`, valid dates, `durationSeconds > 0`, `shortDescription.length <= 160`, `faq.length >= 6` with unique `order` and `?`-terminated questions, `platforms.length >= 3` with `https://` URLs) — FAQ/host assertions may be skipped until T041/T045 exist
- [X] T020 [P] Write `tests/unit/episodes.test.ts` covering `getAllEpisodes` ordering, `getFeaturedEpisode`, `getEpisodeBySlug` miss → `undefined`, `formatDuration` boundaries (59, 60, 3599, 3600)

### Design tokens, theme, fonts

- [X] T021 Add one open-license variable sans-serif WOFF2 to `public/fonts/` (committed; no build-time fetch) and create `lib/fonts.ts` exporting a `next/font/local` instance with `display: 'swap'` and CSS variable `--font-sans`
- [X] T022 Create `app/globals.css`: modern reset; `:root` light tokens and `[data-theme="dark"]` dark tokens (background, surface, text, muted, accent, focus-ring); `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { …dark tokens… } }`; fluid type scale with `clamp()`; `.container` max-width 72rem; global `:focus-visible` outline 2px with AA contrast in both themes; `.visually-hidden`; `html.no-js .theme-toggle { display: none }`
- [X] T023 Create `lib/theme.ts` exporting `THEME_STORAGE_KEY = 'theme'` and `themeInitScript` (string, < 300 bytes) that reads `localStorage.theme`, sets `document.documentElement.dataset.theme` when `'light'|'dark'`, and removes the `no-js` class
- [X] T024 Create `components/ThemeToggle.tsx` (`'use client'`): `<button type="button" class="theme-toggle" aria-pressed aria-label="Switch to dark/light theme">` toggling `data-theme` on `<html>` and persisting to `localStorage`; initial state read from the attribute; styles in `components/ThemeToggle.module.css`
- [X] T025 [P] Write `tests/unit/ThemeToggle.test.tsx`: click toggles `data-theme` and writes `localStorage.theme`; `aria-pressed` reflects state

### Layout & shared components

- [X] T026 Create `components/SiteHeader.tsx` (`<header>` + `<nav aria-label="Primary">` with `<a>` links Home `/`, Episodes `/episodes/`, About `/about/`, FAQ `/faq/`; `aria-current="page"` on the active link via `usePathname` in a small client subcomponent or prop; `ThemeToggle` slot) with `components/SiteHeader.module.css` (responsive: horizontal ≥ 768 px, stacked/wrapped below)
- [X] T027 [P] Create `components/SiteFooter.tsx` (`<footer>` with podcast name, year, and nav repeat) + `components/SiteFooter.module.css`
- [X] T028 Create `app/layout.tsx`: `<html lang="en" className="no-js" suppressHydrationWarning>`, `<head>` inline `<script dangerouslySetInnerHTML={{ __html: themeInitScript }}>` before styles, font variable on `<body>`, `SiteHeader`, `<main id="main">`, `SiteFooter`, skip link `<a href="#main">`; `metadata` with site title template `%s · {podcast.name}` and description
- [X] T029 [P] Create `components/ListenOn.tsx` (`<section aria-labelledby="listen-on">` with `<h2>` "Listen on", `<ul>` of platform badges: `<a href={homeUrl} target="_blank" rel="noopener">` containing `<img src={badgeSrc} alt="" width height>` and visible text `Listen on {name}` + `.visually-hidden` "(opens in new tab)") + `components/ListenOn.module.css`
- [X] T030 Create `app/not-found.tsx` (branded `<h1>` "Episode not found… or page", short message, `<a href="/">` back to home) and confirm `next build` emits `out/404.html`

**Checkpoint**: `npm run build` succeeds, `npm test` passes content + lib + ThemeToggle tests,
layout renders header/nav/footer/theme toggle on an empty home route.

---

## Phase 3: User Story 1 - Discover the Featured Episode (Priority: P1) 🎯 MVP

**Goal**: Landing page with the single featured episode as hero plus "Listen on" badges and
working navigation.

**Independent Test**: Open `/` on desktop and 320 px mobile; hero shows artwork, title, short
description, duration, publish date; CTA links to `/episodes/<featured-slug>/`; nav reaches
Episodes/About/FAQ in one click.

### Implementation for User Story 1

- [X] T031 [P] [US1] Create `components/EpisodeHero.tsx`: `<section aria-labelledby="hero-title">` with `<img src={artworkSrc} alt={artworkAlt} width={600} height={600} fetchPriority="high">`, eyebrow "Featured episode · Ep. {number}", `<h1 id="hero-title">{title}</h1>`, `<p>{shortDescription}</p>`, `<dl>` with duration (`formatDuration`) and `<time dateTime={publishedAt}>{formatDate}</time>`, primary CTA `<a href={`/episodes/${slug}/`}>Listen now</a>`; styles `components/EpisodeHero.module.css` (two-column ≥ 960 px, stacked below; artwork never exceeds viewport)
- [X] T032 [US1] Create `app/page.tsx` (server component): render `EpisodeHero` with `getFeaturedEpisode()`, a short podcast tagline/intro block, and `ListenOn`; export `metadata` title "Home"
- [X] T033 [P] [US1] Write `tests/unit/EpisodeHero.test.tsx` asserting rendered title, alt text, formatted duration/date, and CTA href for a fixture episode
- [X] T034 [US1] Write `tests/e2e/landing.spec.ts`: hero present with all five data points; CTA navigates to featured slug URL; nav links reach `/episodes/`, `/about/`, `/faq/`; ≥ 3 "Listen on" links with `https://`; runs in `chromium`, `mobile`, and `no-js` projects

**Checkpoint**: US1 demoable — landing page complete and passing e2e in all three projects.

---

## Phase 4: User Story 2 - Browse the Episode Catalog (Priority: P2)

**Goal**: Episodes page listing all 20 episodes newest-first, each linking to a dedicated
episode page with full description, working audio player, and "Listen on" badges.

**Independent Test**: `/episodes/` shows exactly 20 cards; selecting one opens
`/episodes/<slug>/` with full details; play/pause/seek works on that episode's own clip; single
column at 320 px with no horizontal scroll.

### Implementation for User Story 2

- [X] T035 [P] [US2] Create `components/EpisodeCard.tsx` (`<li>` → `<article>`: `<img loading="lazy" width={300} height={300} alt>`, "Ep. {number}", `<h3><a href={`/episodes/${slug}/`}>{title}</a></h3>`, `<p>` short description, `<dl>`/meta row with duration and `<time>`) + `components/EpisodeCard.module.css` (card grid: 1 col < 480 px, 2 cols < 960 px, 3 cols ≥ 960 px; long titles wrap, descriptions clamp to 3 lines)
- [X] T036 [US2] Create `app/episodes/page.tsx`: `<h1>Episodes</h1>`, `<ul>` of `EpisodeCard` over `getAllEpisodes()`; `metadata` title "Episodes"
- [X] T037 [P] [US2] Create `components/AudioPlayer.tsx` (`'use client'`): renders native `<audio controls preload="none" src={audioSrc}>` in SSR markup; after mount hides native controls (`controls={false}`) and shows custom UI — play/pause `<button aria-label>`, `<input type="range" aria-label="Seek" min=0 max={duration} step=1>` bound to `timeupdate`/`loadedmetadata`, elapsed/total `<span aria-live="off">`; keyboard operable; styles `components/AudioPlayer.module.css`
- [X] T038 [US2] Create `app/episodes/[slug]/page.tsx`: `generateStaticParams()` from `episodes`; `notFound()` on miss; render `<h1>{title}</h1>`, "Ep. {number}", artwork `<img width={600} height={600}>`, `<time>`, duration, `fullDescription` paragraphs, `AudioPlayer`, `ListenOn`, `<a href="/episodes/">← All episodes</a>`; `generateMetadata` per episode
- [X] T039 [P] [US2] Write `tests/unit/AudioPlayer.test.tsx` (mock `HTMLMediaElement.prototype.play/pause`): initial SSR markup contains `<audio controls>`; clicking play calls `play()`; range change sets `currentTime`
- [X] T040 [US2] Write `tests/e2e/episodes.spec.ts`: exactly 20 `<li>` on `/episodes/` in newest-first order (compare `datetime` attributes); first card link opens its slug URL with `<h1>` matching; play then pause toggles `audio.paused`; seeking changes `currentTime`; `src` differs between two episode pages; single column and no horizontal overflow in `mobile` project; `no-js` project shows native `<audio controls>`

**Checkpoint**: US1 + US2 independently functional; 22 pages export under `out/episodes/`.

---

## Phase 5: User Story 3 - Learn About the Podcast (Priority: P3)

**Goal**: About page with introduction, host profile (photo, name, bio), and mission.

**Independent Test**: `/about/` shows three headed sections: Introduction, Host (photo + bio),
Mission.

### Implementation for User Story 3

- [X] T041 [P] [US3] Add optimized host photo `public/host.jpg` (≤ 60 KB, 800×800) and create `content/host.ts` exporting `host: Host` (`photoSrc: '/host.jpg'`, non-empty `photoAlt`, `bio` ≤ 600 chars)
- [X] T042 [US3] Create `app/about/page.tsx`: `<h1>About {podcast.name}</h1>`; `<section aria-labelledby="about-intro">` (introduction), `<section aria-labelledby="about-host">` (`<img src={host.photoSrc} alt={host.photoAlt} width={400} height={400}>`, `<h2>`, bio), `<section aria-labelledby="about-mission">`; styles `app/about/page.module.css`; `metadata` title "About"
- [X] T043 [US3] Extend `tests/unit/content.test.ts` to assert `host.photoSrc` exists under `public/` and `host.bio.length <= 600`
- [X] T044 [US3] Write `tests/e2e/about.spec.ts`: three sections visible with headings; host image has non-empty `alt`; passes in `no-js`

**Checkpoint**: About page complete and independently testable.

---

## Phase 6: User Story 4 - Get Answers to Common Questions (Priority: P4)

**Goal**: FAQ page with ≥ 6 collapsed-by-default question/answer pairs that expand/collapse
with mouse or keyboard, including with JavaScript disabled.

**Independent Test**: `/faq/` loads with all answers collapsed; Tab to a question and press Enter
reveals its answer; Enter again collapses; works in `no-js` project.

### Implementation for User Story 4

- [X] T045 [P] [US4] Create `content/faq.ts` exporting `faq: readonly FaqItem[]` with ≥ 6 items (subscribe, release schedule, contact, guest requests, transcripts, support); unique kebab-case `id`, unique ascending `order`, each `question` ends with `?`
- [X] T046 [P] [US4] Create `components/FaqList.tsx`: `<div>` of `<details id={id}>` (no `open`) with `<summary>{question}</summary>` and `<div>` answer, sorted by `order`; styles `components/FaqList.module.css` (custom marker via `summary::marker`/`::after`, visible focus on summary)
- [X] T047 [US4] Create `app/faq/page.tsx`: `<h1>Frequently asked questions</h1>`, intro sentence, `FaqList`; `metadata` title "FAQ"
- [X] T048 [US4] Enable the FAQ assertions in `tests/unit/content.test.ts` (`faq.length >= 6`, unique `order`, `?` suffix)
- [X] T049 [US4] Write `tests/e2e/faq.spec.ts`: ≥ 6 `details` all without `open` on load; keyboard Enter on a `summary` toggles `open`; click toggles back; passes in `no-js`

**Checkpoint**: All four user stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Constitution gates, responsiveness/accessibility verification, and reproducibility.

- [X] T050 [P] Write `tests/e2e/theme.spec.ts`: toggle switches `data-theme`; reload keeps theme with no intermediate flash (assert `data-theme` set before first `domcontentloaded` paint via `page.evaluate` on `document.documentElement.dataset.theme`); navigating to `/episodes/` keeps theme; `no-js` project hides `.theme-toggle` and follows `prefers-color-scheme` via `page.emulateMedia`
- [X] T051 [P] Write `tests/e2e/responsive.spec.ts`: for each of `/`, `/episodes/`, first episode page, `/about/`, `/faq/`, at 320/768/1280/1920 px assert `document.documentElement.scrollWidth <= innerWidth`
- [X] T052 [P] Write `tests/e2e/keyboard.spec.ts`: Tab through each page; every `a, button, summary, input[type=range], audio` receives focus with a visible outline (`getComputedStyle(...).outlineStyle !== 'none'`)
- [X] T053 [P] Write `tests/e2e/a11y.spec.ts`: run `@axe-core/playwright` (`wcag2a`, `wcag2aa` tags) on every page in both `data-theme="light"` and `"dark"`; zero violations
- [X] T054 [P] Write `tests/e2e/not-found.spec.ts`: request `/does-not-exist/` on the preview server returns branded page with link to `/`
- [X] T055 Run `npm run build` then `npm run validate:html` and fix any html-validate errors across `out/**/*.html` (zero errors required)
- [X] T056 Run `npm run check:links` against `out/` and fix any broken internal links or unresolvable platform `homeUrl`s
- [X] T057 Run `npm run lhci` and tune until Performance ≥ 90, Accessibility ≥ 90, and script size ≤ 200 KB on every audited page (verify only `ThemeToggle` and `AudioPlayer` are client components; confirm `preload="none"` on audio; confirm `width`/`height` on all images)
- [X] T058 [P] Add GitHub Actions workflow `.github/workflows/ci.yml` running on PRs: `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm run validate:html`, `npm run check:links`, `npx playwright install --with-deps`, `npm run test:e2e`, `npm run lhci`
- [X] T059 [P] Write `README.md` at repo root: project summary, prerequisites, the commands from quickstart.md, publish directory `out/`, and a link to `specs/001-podcast-website/`
- [X] T060 Execute every scenario in `specs/001-podcast-website/quickstart.md` from a clean clone (`git clean -xfd && npm ci && npm run build`) and record pass/fail; fix any failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Phase 1 — **blocks all user stories**
- **User Stories (Phases 3–6)**: each depends only on Phase 2; can run in parallel or in
  priority order US1 → US2 → US3 → US4
- **Polish (Phase 7)**: depends on all desired user stories

### User Story Dependencies

- **US1 (P1)**: Phase 2 only. Hero CTA links to an episode URL that exists once US2 ships; until
  then the link resolves to 404 (acceptable for MVP demo, not for release link-check).
- **US2 (P2)**: Phase 2 only. Independent of US1.
- **US3 (P3)**: Phase 2 only. Independent.
- **US4 (P4)**: Phase 2 only. Independent.

### Within Phase 2

- T011 → T012, T013, T015, T018 (types first)
- T015 → T016, T017 (artwork/audio filenames follow episode numbering) → T019 (asset existence)
- T021, T022, T023 → T024 → T028
- T026, T027, T029 → T028 (layout composes header/footer; home composes ListenOn)

### Within Each User Story

- Components before pages; pages before e2e specs; unit tests may run in parallel with pages.

### Parallel Opportunities

- Phase 1: T003–T010 all parallel after T001/T002.
- Phase 2: T012, T013, T014 ∥; T016, T017, T019, T020 ∥ after T015; T025, T027, T029 ∥.
- Phases 3–6 can be assigned to four developers simultaneously after Phase 2.
- Phase 7: T050–T054, T058, T059 all parallel; T055–T057 sequential after a build.

---

## Parallel Example: User Story 1

```text
# After Phase 2 completes:
Parallel:  T031 (EpisodeHero component)  ∥  T033 (EpisodeHero unit test)
Then:      T032 (app/page.tsx)
Then:      T034 (landing e2e across chromium / mobile / no-js)
```

## Parallel Example: User Story 2

```text
Parallel:  T035 (EpisodeCard)  ∥  T037 (AudioPlayer)  ∥  T039 (AudioPlayer unit test)
Then:      T036 (episodes page)  ∥  T038 ([slug] page)
Then:      T040 (episodes e2e)
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phases 1–2 (setup + foundation, including all 20 episodes' content and assets).
2. Phase 3 (US1) → **STOP and demo**: a premium landing page with featured hero, theme toggle,
   nav, and Listen-on badges, already passing no-JS, mobile, and keyboard checks.

### Incremental Delivery

1. + Phase 4 (US2) → full catalog + 20 episode pages with playback → release candidate.
2. + Phase 5 (US3) → About.
3. + Phase 6 (US4) → FAQ.
4. Phase 7 → all constitution gates green; CI enforces them on every PR.

### Notes

- Keep every component a server component unless it needs browser APIs (`ThemeToggle`,
  `AudioPlayer`) to protect the 200 KB JS budget.
- Never introduce runtime data fetching, API routes, or `next/image` with the default loader —
  all three break `output: 'export'` or Principle I.
- Commit generated assets (audio, artwork, fonts); never fetch them at build time.
