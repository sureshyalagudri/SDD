# Feature Specification: Episode List & Card View Toggle

**Feature Branch**: `002-episode-view-toggle`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: "Add both list and card view for episodes. Provide configuration so that user can change as per his need."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Between Card and List View (Priority: P1)

A listener on the Episodes page wants to scan episodes differently depending on their goal:
browsing visually (large artwork, card grid) or scanning quickly (compact rows showing more
episodes per screen). A clearly labelled view switcher at the top of the catalog lets them flip
between **Card view** (the current grid) and **List view** instantly, without a page reload and
without losing their place in the catalog.

**Why this priority**: This is the feature itself; without the switcher there is no second view.
It is independently valuable and demoable on its own.

**Independent Test**: Open `/episodes/`; confirm the card grid is shown by default with the
switcher indicating "Card" is active; activate "List"; confirm the same 20 episodes are rendered
as compact rows in the same newest-first order, with the switcher now indicating "List"; activate
"Card" to return.

**Acceptance Scenarios**:

1. **Given** a first-time visitor opens the Episodes page, **When** it loads, **Then** episodes
   are displayed in Card view and the view switcher shows Card as the selected option.
2. **Given** Card view is shown, **When** the visitor selects List view, **Then** all 20 episodes
   re-render as compact rows (artwork thumbnail, episode number, title, duration, publish date)
   in the same order, with no page reload and the switcher showing List as selected.
3. **Given** List view is shown, **When** the visitor selects an episode title, **Then** they are
   taken to that episode's dedicated page exactly as from Card view.
4. **Given** either view, **When** the visitor operates the switcher by keyboard, **Then** the
   view changes and the newly selected option is announced to assistive technology.

---

### User Story 2 - Remember My Preferred View (Priority: P2)

A listener who prefers List view does not want to re-select it on every visit. Once chosen, the
preference is remembered on that browser and applied automatically the next time the Episodes
page is opened — including after closing and reopening the browser.

**Why this priority**: "Configure as per need" implies the choice sticks; without persistence the
switcher is a per-visit toy. Depends on US1 existing but is separately testable.

**Independent Test**: Select List view; reload the page — List view is shown immediately with no
visible flash of the card grid; navigate away and return — still List; clear site data — Card view
returns as default.

**Acceptance Scenarios**:

1. **Given** the visitor has selected List view, **When** they reload the Episodes page, **Then**
   List view is displayed on first paint without first showing Card view.
2. **Given** the visitor selected List view earlier, **When** they return to the Episodes page in a
   later browser session, **Then** List view is still applied.
3. **Given** a stored preference, **When** the visitor switches back to Card view, **Then** the
   stored preference updates and subsequent visits show Card view.
4. **Given** the visitor has never chosen a view (or has cleared site data), **When** they open
   the Episodes page, **Then** Card view is shown.

---

### User Story 3 - Readable List View on Every Screen (Priority: P3)

A listener on a phone in List view still sees every episode's key facts without horizontal
scrolling; a listener on a wide desktop sees a comfortable, aligned table-like layout rather than
rows stretched edge to edge.

**Why this priority**: Quality of the new view across devices; the feature works without it but
would not meet the project's responsiveness and accessibility bar.

**Independent Test**: In List view, resize to 320 px, 768 px, 1280 px, and 1920 px; confirm no
horizontal overflow, every row still shows number, title, duration, and date, and long titles
wrap rather than clip.

**Acceptance Scenarios**:

1. **Given** List view at 320 px wide, **When** rows render, **Then** each row shows thumbnail,
   episode number, title, duration, and date without horizontal scrolling.
2. **Given** List view at ≥ 1280 px, **When** rows render, **Then** columns are visually aligned
   across rows and content width is capped to the page container.
3. **Given** an episode with a very long title, **When** shown in List view, **Then** the title
   wraps onto additional lines and the row grows in height without breaking alignment of other
   rows.

---

### Edge Cases

- The visitor has JavaScript disabled: the Episodes page renders Card view (the default) with all
  20 episodes; the view switcher is hidden; no broken or empty state is shown.
- Browser storage is unavailable or blocked: the switcher still changes the view for the current
  page; the choice simply is not remembered on the next visit.
- A stored preference contains an unexpected value: it is ignored and Card view is used.
- The visitor switches view while partway down the page: the page does not jump back to the top
  unexpectedly beyond the natural re-layout.
- Artwork fails to load in List view: the thumbnail area shows a placeholder and the row layout
  stays intact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Episodes page MUST offer exactly two presentation modes for the catalog: Card
  view (grid of cards with large artwork — the existing layout) and List view (compact rows).
- **FR-002**: The Episodes page MUST show a view switcher, located above the catalog, with two
  mutually exclusive options labelled "Card" and "List" (icon plus visible text label).
- **FR-003**: The switcher MUST indicate which view is currently active, both visually and to
  assistive technology.
- **FR-004**: Switching views MUST re-render the catalog in place without a full page reload and
  MUST preserve the episode set (all 20) and newest-first order.
- **FR-005**: List view rows MUST each display: artwork thumbnail, episode number, title (linking
  to the episode's dedicated page), duration, and publish date. Short description MAY be shown on
  wider screens but MUST NOT be required for the row to be understandable.
- **FR-006**: Card view MUST remain the default for visitors with no stored preference.
- **FR-007**: The visitor's selected view MUST be remembered in the browser and reapplied on
  subsequent visits to the Episodes page, including across browser sessions, until changed or
  site data is cleared.
- **FR-008**: A remembered view MUST be applied before the catalog is first painted so the
  visitor never sees the other view flash first.
- **FR-009**: Without JavaScript the Episodes page MUST render Card view with all episodes and
  MUST hide the switcher; the page MUST remain fully usable.
- **FR-010**: The switcher MUST be operable by keyboard alone, have a visible focus indicator,
  and announce the selected state; both views MUST satisfy the project's accessibility
  requirements (semantic structure, alt text, WCAG 2.1 AA contrast in light and dark themes).
- **FR-011**: Both views MUST render without horizontal overflow at 320 px, 768 px, 1280 px, and
  1920 px viewport widths; long titles MUST wrap rather than clip.
- **FR-012**: Invalid or unknown stored preference values MUST be ignored and treated as
  "no preference".
- **FR-013**: The feature MUST NOT change the content, order, or links of the catalog in any
  way other than presentation.

### Key Entities

- **View Preference**: The visitor's chosen catalog presentation. Values: `card` | `list`;
  absent means default (`card`). Stored per browser; not shared across devices; not tied to any
  account (there are none).
- **Episode** (existing): unchanged; List view consumes the same attributes already shown on
  cards (number, title, short description, artwork, duration, publish date, slug).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can switch from Card to List view (or back) in a single interaction and
  the catalog updates in under 100 ms perceived delay (no visible loading state).
- **SC-002**: 100% of the 20 episodes remain visible, in identical order, in both views at every
  tested viewport width.
- **SC-003**: After choosing a view, 100% of subsequent Episodes-page loads in the same browser
  show that view on first paint with zero flashes of the other view.
- **SC-004**: List view displays at least 2× as many episodes per screen as Card view at 1280 px
  width (scan-ability goal).
- **SC-005**: The switcher and both views pass automated WCAG 2.1 AA checks in light and dark
  themes with zero violations, and 100% of switcher controls are keyboard operable.
- **SC-006**: The Episodes page keeps its existing automated performance and accessibility
  audit scores at or above 90 after the feature is added.

## Assumptions

- The view switcher appears only on the Episodes page; the landing page hero and episode detail
  pages are unaffected.
- Preference is stored in the browser only (no accounts, no server), mirroring how the existing
  light/dark theme choice is remembered; the two preferences are independent.
- "Configuration" means the visitor's own in-page choice; there is no site-owner configuration
  file or admin setting required for this feature.
- List view uses a small square thumbnail of the existing artwork; no new assets are needed.
- Card view keeps its current design; this feature adds List view and the switcher but does not
  redesign cards.
- The project constitution governs: static-first, no-JS core rendering (Card view), performance
  budget, and accessibility requirements all continue to apply.
