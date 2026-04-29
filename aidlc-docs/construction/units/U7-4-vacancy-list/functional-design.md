# Functional design: U7-4-vacancy-list

## Purpose

Define the baseline vacancy-list flow so structured vacancy records can be returned in stable list form for later company management and approved student-discovery experiences.

## User story

As a company user and later as a student searcher, I need stable vacancy lists so the platform can surface active opportunities consistently before detail, application, and matching workflows.

## Functional requirements

### 1. Vacancy-list scope

- This unit covers list-form retrieval of vacancy records only.
- The baseline should support:
  - returning vacancies in a stable ordered collection
  - distinguishing active and non-active vacancy states according to approved visibility rules
  - presenting stable summary fields needed for later management and discovery contexts
  - returning predictable empty, no-visible-results, or unauthorized outcomes where appropriate
- Vacancy detail, student search filtering, applications, bookmarks, and matching remain separate later units.

### 2. Access and visibility posture

- Vacancy listing may serve more than one later context, but access rules must remain explicit.
- Company-side vacancy lists should return company-owned vacancies in the authenticated company context.
- Later student or public job-list experiences may consume only the appropriately visible subset of active vacancies and remain separate units.
- Hidden, draft, removed, or unauthorized vacancy records must not appear in contexts where they are not allowed.

### 3. List data and summary behavior

- Vacancy list should consume structured **Vacancy** records and stable availability state.
- The baseline should support summary fields such as vacancy identity, title, company context where allowed, location summary, employment type, and active-state indicators.
- Invalid visibility context, inconsistent active-versus-removed state, or malformed list inputs must return stable outcomes rather than exposing conflicting or unauthorized records.
- Vacancy list should remain summary-oriented and should not replace the dedicated vacancy-detail unit.

### 4. Ordering and stable outcomes

- The baseline should support a stable default ordering strategy suitable for later management or discovery refinement.
- Empty lists, no-visible-results lists, and company-bound lists should remain clearly distinguishable outcomes.
- Later implementation may refine pagination, sorting, and filters, but the baseline should already assume predictable list behavior.
- List behavior must remain aligned with the active-versus-removed posture defined by earlier vacancy CRUD units.

### 5. Frontend and API alignment

- Company-side vacancy list belongs in an authenticated company route area; later student-facing job list experiences remain separate units.
- The final API shape for vacancy lists may be refined later, but it must remain consistent with the existing versioned REST baseline and standard error envelopes.
- Vacancy-list state should use global state only where shared shell or session context requires it; most list state should remain local to the feature.

### 6. Relationship to later units

- U7-5 vacancy detail should build on the same vacancy identity and visibility posture used in the list.
- Phase 8 job-list and filtering units may consume the visible vacancy-list baseline without redefining active vacancy rules.
- Later application, bookmark, and matching units should depend on the same list availability posture rather than inventing alternate visible-vacancy sets.
- Requirement-tag units remain separate and should enrich vacancy data without redefining list behavior.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-4 base API structure
- U1-6 routing and navigation
- U1-7 global state management
- U7-1 vacancy create
- U7-2 vacancy edit
- U7-3 vacancy delete

## Outputs

- Baseline vacancy-list flow
- Stable list-summary and visibility expectations
- Integration expectations for later detail, search, application, and matching units

## User flow

1. A company management or later discovery context requests a vacancy list.
2. Backend evaluates the applicable visibility posture for that context.
3. The platform returns the stable visible subset of vacancy summaries in a predictable order.
4. Frontend renders the resulting list, empty, or no-visible-results state clearly.
5. Later detail, search, application, and matching units build on the same vacancy-list baseline.

## Acceptance criteria

- Vacancy-list behavior is documented clearly.
- Access posture, stable list outcomes, and active-vacancy expectations are defined.
- Structured summary expectations and ordering posture are documented.
- The unit is kept separate from vacancy detail, search filters, applications, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Vacancy-detail rendering
- Search filters and query UX
- Applications, bookmarks, or matching logic
- Requirement-tag editing behavior
- Analytics or ranking logic
