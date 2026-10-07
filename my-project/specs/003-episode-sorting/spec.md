# Feature Specification: Episode Sorting

**Feature Branch**: `003-episode-sorting`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: "Add sorting to the episodes. Provide option to sort."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a Sort Order (Priority: P1)

A listener on the Episodes page wants the catalog in an order that suits what they are doing:
catching up from the beginning, finding a short episode for a commute, or locating a title they
half-remember. A clearly labelled sort control next to the existing view switcher offers a small
set of orders; choosing one immediately re-orders all 20 episodes in place, in whichever view
(Card or List) is active, without a page reload.

**Why this priority**: This is the feature itself. Without the control there is no sorting; it is
independently valuable and demoable alone.

**Independent Test**: Open `/episodes/`; confirm the default order is newest first and the control
shows that; choose "Oldest first" — the first episode becomes Episode 1 and the last Episode 20;
choose "Title A–Z" — titles appear alphabetically; choose "Shortest first" — durations ascend;
return to "Newest first" and the original order is restored.

**Acceptance Scenarios**:

1. **Given** a first-time visitor opens the Episodes page, **When** it loads, **Then** episodes are
   ordered newest first and the sort control indicates "Newest first".
2. **Given** any view, **When** the visitor chooses "Oldest first", **Then** the same 20 episodes
   re-render in ascending publish-date order with no page reload, and the control shows the
   new choice.
3. **Given** the visitor chooses "Title A–Z" or "Title Z–A", **Then** episodes are ordered by
   title alphabetically (case-insensitive) in the chosen direction.
4. **Given** the visitor chooses "Shortest first" or "Longest first", **Then** episodes are ordered
   by duration in the chosen direction.
5. **Given** the visitor changes the sort order, **When** the re-order completes, **Then** the
   change is announced to assistive technology (e.g., "Sorted by oldest first").
6. **Given** the visitor is in List view, **When** they change the sort, **Then** the catalog stays
   in List view and only the order changes (and vice versa for Card view).

---

### User Story 2 - Remember My Sort Order (Priority: P2)

A listener who always wants "Oldest first" (working through the back catalog) should not have to
re-select it every visit. The chosen order is remembered on that browser and applied the next time
the Episodes page is opened, including after closing the browser.

**Why this priority**: Consistent with how the theme and view preferences already behave;
without it the control is per-visit only.

**Independent Test**: Choose "Oldest first"; reload — order and control reflect it immediately
with no visible re-shuffle; navigate away and back — still "Oldest first"; clear site data —
"Newest first" returns.

**Acceptance Scenarios**:

1. **Given** a remembered sort order, **When** the Episodes page is reloaded, **Then** the
   episodes are already in that order on first paint and the control shows it.
2. **Given** a remembered order, **When** the visitor returns in a later browser session, **Then**
   the same order is applied.
3. **Given** a remembered order, **When** the visitor selects "Newest first", **Then** the stored
   preference updates and later visits show newest first.
4. **Given** no stored preference or a cleared one, **When** the page opens, **Then** newest first
   is used.

---

### User Story 3 - Sort and View Work Together (Priority: P3)

A listener switches freely between Card and List views and between sort orders; each control
changes only its own aspect, both choices are remembered independently, and the two controls sit
together as a single, tidy toolbar on every screen size.

**Why this priority**: Prevents the two preference controls from fighting each other and keeps
the toolbar usable on phones; the feature works without this polish but would feel broken if it
regressed the view switcher.

**Independent Test**: Set List view + "Longest first"; reload — both persist; switch to Card —
order unchanged; change sort — view unchanged; at 320 px wide the toolbar wraps without
horizontal scrolling and both controls remain operable.

**Acceptance Scenarios**:

1. **Given** List view and "Longest first" are selected, **When** the page is reloaded, **Then**
   both are applied together.
2. **Given** any sort order, **When** the visitor switches view, **Then** the order is unchanged.
3. **Given** the toolbar at 320 px wide, **When** it renders, **Then** heading, view switcher, and
   sort control are all visible and operable with no horizontal overflow.

---

### Edge Cases

- JavaScript disabled: the Episodes page renders newest first (the default) with all 20 episodes;
  the sort control is hidden; nothing appears broken.
- Browser storage unavailable: sorting still works for the current page; the choice is simply not
  remembered.
- Stored preference holds an unexpected value: it is ignored and newest first is used.
- Two episodes share the same sort key (e.g., identical duration or publish date): ties are
  broken by episode number descending so the order is stable and repeatable.
- Titles beginning with articles or punctuation ("The …", "A …", "Why …"): sorted by the title
  exactly as displayed, case-insensitively; no stop-word stripping.
- Episode titles with accented or non-Latin characters: ordered using locale-aware comparison so
  they appear where a reader would expect.
- The visitor changes sort while scrolled down the page: the page does not jump unexpectedly
  beyond the natural re-layout; focus stays on the sort control.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Episodes page MUST provide a sort control, placed in the catalog toolbar
  alongside the view switcher, labelled "Sort by".
- **FR-002**: The sort control MUST offer exactly these six orders, with these labels and
  semantics:
  - "Newest first" — publish date descending (default)
  - "Oldest first" — publish date ascending
  - "Title A–Z" — title ascending, case-insensitive, locale-aware
  - "Title Z–A" — title descending, case-insensitive, locale-aware
  - "Shortest first" — duration ascending
  - "Longest first" — duration descending
- **FR-003**: Ties on the chosen key MUST be broken by episode number descending.
- **FR-004**: Choosing an order MUST re-order the catalog in place without a full page reload,
  MUST preserve the complete set of 20 episodes, and MUST NOT change the active view.
- **FR-005**: The control MUST indicate the currently selected order both visually and to
  assistive technology, and each change MUST be announced to assistive technology.
- **FR-006**: "Newest first" MUST be the order for visitors with no stored preference.
- **FR-007**: The selected order MUST be remembered in the browser and reapplied on later visits,
  including across browser sessions, until changed or site data is cleared.
- **FR-008**: A remembered order MUST be applied before the catalog is first painted so visitors
  never see the episodes visibly re-shuffle on load.
- **FR-009**: Without JavaScript the page MUST render newest first with all episodes and MUST hide
  the sort control; the page MUST remain fully usable.
- **FR-010**: The control MUST be operable by keyboard alone, have a visible focus indicator, and
  satisfy the project's accessibility requirements (WCAG 2.1 AA contrast in both themes).
- **FR-011**: Unknown or invalid stored values MUST be ignored and treated as "no preference".
- **FR-012**: The toolbar containing heading, view switcher, and sort control MUST render without
  horizontal overflow at 320 px, 768 px, 1280 px, and 1920 px.
- **FR-013**: Sorting MUST NOT alter any episode's content, link, or presentation beyond its
  position in the catalog; the sort and view preferences MUST be independent of each other.

### Key Entities

- **Sort Preference**: The visitor's chosen catalog order. Values: `newest` | `oldest` |
  `title-asc` | `title-desc` | `shortest` | `longest`; absent means default (`newest`). Stored
  per browser; independent of the View Preference and theme.
- **Episode** (existing, unchanged): sorting uses `publishedAt`, `title`, `durationSeconds`, and
  `number` (tie-break).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can change the sort order in at most two interactions (open control,
  pick option) and the catalog re-orders with no perceptible delay (< 100 ms, no loading state).
- **SC-002**: For every one of the six orders, 100% of the 20 episodes remain present and the
  sequence matches the defined key and tie-break exactly.
- **SC-003**: After choosing an order, 100% of later Episodes-page loads in the same browser show
  that order on first paint with zero visible re-shuffles.
- **SC-004**: Changing sort never changes the active view, and changing view never changes the
  sort, in 100% of tested combinations.
- **SC-005**: The sort control and the toolbar pass automated WCAG 2.1 AA checks in light and
  dark themes with zero violations; the control is fully keyboard operable.
- **SC-006**: The Episodes page keeps its automated performance and accessibility audit scores at
  or above 90 after the feature is added.

## Assumptions

- The sort control appears only on the Episodes page (the only catalog); the landing hero and
  episode detail pages are unaffected.
- "Option to sort" is interpreted as a visitor-facing control with a fixed set of sensible orders;
  there is no owner-side configuration of available orders.
- The default order remains newest first, matching the existing catalog behaviour and the
  featured-episode logic.
- Preference is browser-local only (no accounts, no server), mirroring the theme and view
  preferences.
- A compact native-style dropdown/select is the expected control shape, as six options are too
  many for a segmented button group; the exact styling is a design decision.
- Sorting is purely client-side over the embedded sample data; no search, filtering, or pagination
  is introduced by this feature.
- The project constitution continues to govern: static-first, no-JS core rendering (default
  order), performance budget, and accessibility requirements.
