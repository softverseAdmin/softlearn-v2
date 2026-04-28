# Functional design: U1-8-base-ui-layout

## Purpose

Define the baseline UI layout model for the shared React frontend so students, company users, and admins all use a consistent application shell and reusable page structure.

## User story

As a delivery team, we need a common UI layout baseline so later pages can plug into a predictable shell with consistent headers, navigation regions, content areas, and cross-app feedback patterns.

## Functional requirements

### 1. Shared application shell

- Define a base application shell for authenticated product workflows.
- The shell should support:
  - header or top bar
  - primary navigation region
  - main content area
  - optional secondary page context areas later
  - global feedback areas for loading, alerts, or notifications when needed

### 2. Public versus authenticated layouts

- Public screens such as login, signup, and password-reset flows should use a simpler unauthenticated layout.
- Authenticated screens should use the shared application shell with role-aware navigation and page framing.
- Layout transitions between public and authenticated experiences should remain clear and predictable.

### 3. Role-aware layout behavior

- Students, company users, and admins should share one overall design system direction while still allowing role-specific navigation and content emphasis.
- The base layout should support different menu sets or dashboard entry points without requiring separate applications.
- Privileged or role-restricted areas should appear only in layouts where they are relevant to the authenticated role.

### 4. Page structure conventions

- Define a consistent page composition model for:
  - page title or context header
  - primary actions
  - content sections
  - empty, loading, error, and not-found states
- Layout rules should support later dashboards, forms, lists, detail pages, and workflow screens.

### 5. Cross-app UX consistency

- Shared layout should provide consistent positioning and presentation for navigation, logout, global status, and major feedback states.
- The base layout should support accessibility-friendly structure and predictable orientation across routes.
- The layout should work with routing and global state without embedding feature-specific logic into the shell.

### 6. Relationship to later units

- This unit defines the base layout structure only.
- Later units may refine visual design, components, dashboards, and domain-specific page patterns without breaking the shared shell baseline.

## Inputs

- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- Inception requirements baseline

## Outputs

- Baseline public and authenticated layout model
- Shared page composition conventions
- Role-aware shell direction for later frontend feature units

## User flow

1. User loads a public or authenticated route.
2. App selects the corresponding layout shell.
3. Shared navigation and page framing are rendered according to auth and role context.
4. Later feature pages provide content inside the consistent layout structure.

## Acceptance criteria

- Public and authenticated layout shells are defined.
- Role-aware layout behavior is documented for students, company users, and admins.
- Shared page composition rules are documented.
- The layout baseline is separated from later page-level implementation.
- No application code is produced in this unit.

## Out of scope

- Concrete React component code
- Final visual design system or brand styling
- Final component library selection
- Page-specific layouts for every later feature
- Detailed dashboard implementation
