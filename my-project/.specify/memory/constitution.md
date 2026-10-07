<!--
Sync Impact Report
- Version change: (unversioned template) → 1.0.0
- Modified principles: none (initial ratification; all placeholders filled)
- Added sections:
  - Core Principles: I. Static-First, II. Accessibility & Semantic HTML,
    III. Performance Budget, IV. Content & Asset Integrity, V. Simplicity
  - Technical Constraints
  - Development Workflow
  - Governance
- Removed sections: none
- Templates requiring updates: none (plan/spec/tasks templates read this file at runtime)
- Follow-up TODOs: none
-->

# My Project Constitution

## Core Principles

### I. Static-First
The site MUST be deliverable as a set of static files (HTML, CSS, JS, images, fonts) from a
plain static host or CDN. No server-side runtime, database, or per-request backend code is
permitted. Any dynamic behavior MUST run in the browser or call an external, documented API.
Rationale: static output keeps hosting trivial, secure, cheap, and reproducible.

### II. Accessibility & Semantic HTML
Pages MUST use semantic HTML elements (landmarks, headings in order, lists, buttons vs. links).
All images MUST have meaningful `alt` text (or empty `alt` when decorative). Interactive elements
MUST be keyboard operable and have visible focus. Color contrast MUST meet WCAG 2.1 AA.
Rationale: accessible markup is the baseline for usability, SEO, and legal compliance.

### III. Performance Budget
Each page MUST load with no more than 200 KB of compressed JavaScript and MUST score at least 90
on Lighthouse Performance for mobile. Images MUST be sized/compressed for their display context
and lazy-loaded when below the fold. Third-party scripts MUST be justified in the plan.
Rationale: static sites exist to be fast; budgets prevent gradual bloat.

### IV. Content & Asset Integrity
All source content and assets MUST live in version control; no build step may fetch unversioned
inputs. Links and asset references MUST resolve (a broken-link check MUST pass before merge).
Generated output MUST be reproducible from a clean checkout with a single documented command.
Rationale: reproducibility and integrity are what make a static site trustworthy to deploy.

### V. Simplicity
Prefer plain HTML/CSS/JS over frameworks; a framework or build tool MUST be justified by a
concrete need recorded in the plan. YAGNI applies: no abstractions, components, or configuration
for features not in the current spec.
Rationale: minimal tooling lowers maintenance cost and keeps onboarding trivial.

## Technical Constraints

- Output MUST be plain static files under a single publish directory (e.g., `dist/` or `public/`).
- HTML MUST validate (W3C validator or equivalent) with zero errors.
- The site MUST function with JavaScript disabled for core content; JS is progressive enhancement.
- All pages MUST be served over HTTPS; mixed content is prohibited.
- No secrets, tokens, or credentials may appear in the repository or published output.
- Supported browsers: latest two versions of major evergreen browsers (Chrome, Edge, Firefox,
  Safari); no polyfills for unsupported browsers without justification.

## Development Workflow

- Every change goes through a pull request; direct pushes to the main branch are prohibited.
- A PR MUST pass before merge: build succeeds from clean checkout, HTML validation, broken-link
  check, and Lighthouse Performance/Accessibility ≥ 90 on changed pages.
- Reviewers MUST verify the change against these principles and reject unjustified complexity.
- Deployments are produced only from the main branch via the documented build command.

## Governance

This constitution supersedes all other project practices. Amendments require: (1) a PR editing
this file with the rationale, (2) approval by at least one maintainer, and (3) an updated
version line following semantic versioning — MAJOR for removing or redefining a principle,
MINOR for adding a principle or materially expanding guidance, PATCH for clarifications.
Every spec, plan, and PR review MUST check compliance with these principles; deviations MUST be
recorded and justified in the plan's Complexity Tracking section.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
