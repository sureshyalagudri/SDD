# Signal & Noise — podcast website

A fully static, responsive podcast site built with Next.js (App Router, `output: 'export'`).
Landing page with a featured-episode hero, a catalog of 20 episodes with dedicated detail pages
and a working audio player, About and FAQ pages, light/dark theme, and no backend — all content
is embedded sample data in `content/`. The Episodes catalog offers a Card (grid) / List view
switcher whose choice is remembered in the browser.

Specification, plan, and tasks live in [specs/001-podcast-website/](specs/001-podcast-website/).
Project principles are in [.specify/memory/constitution.md](.specify/memory/constitution.md).

## Prerequisites

- Node.js 20 LTS (or newer) and npm 10+
- No environment variables, accounts, or network services are required

## Commands

```powershell
npm ci                 # install from lockfile
npm run dev            # http://localhost:3000 with hot reload
npm run build          # static export → out/
npm run preview        # serve out/ on http://localhost:3000
```

### Quality gates (all enforced in CI)

```powershell
npm run lint           # ESLint (next/core-web-vitals + jsx-a11y)
npm test               # Vitest: content invariants, lib helpers, components
npm run validate:html  # html-validate over out/**/*.html
npm run check:links    # crawl out/ for broken internal/external links
npm run test:e2e       # Playwright: chromium, 320px mobile, and JavaScript-disabled projects
npm run lhci           # Lighthouse CI: slow-4G perf ≥ 90 / a11y ≥ 90 / script ≤ 200 KB, then typical-4G TTI ≤ 2 s
```

First e2e run: `npx playwright install chromium`.

### Regenerating sample assets

```powershell
npm run generate:audio               # 20 short placeholder MP3 clips → public/audio
node scripts/generate-artwork.mjs    # 20 SVG artworks → public/artwork
```

Generated output is committed; the build never fetches anything.

## Publish

Deploy the `out/` directory to any static host over HTTPS. `trailingSlash: true` produces
`/path/index.html` files that work without rewrite rules; `404.html` is served for unknown URLs
by hosts that support it.

## Structure

```text
src/app/           routes (layout, landing, episodes, episodes/[slug], about, faq, not-found)
src/components/    SiteHeader, SiteFooter, NavLinks, ThemeToggle, ViewSwitcher, EpisodeHero,
                   EpisodeCard, AudioPlayer, ListenOn, FaqList
src/content/       embedded sample data (podcast, host, episodes, faq, platforms)
src/lib/           types, episode helpers, theme + view bootstrap scripts, local font
src/tests/         unit/ (Vitest) and e2e/ (Playwright)
src/test-results/  generated: Playwright traces + HTML report, Lighthouse reports (git-ignored)
public/            static assets served at / (artwork/, audio/, badges/, fonts/, host.svg)
scripts/           dev tooling: asset generators and link checker
```

`public/` must stay at the repo root (Next.js serves static assets only from there); `scripts/`
are build-time tooling rather than application code, so they also stay at the root.
