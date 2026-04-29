# Functional design: U7-5-vacancy-detail

## Purpose

Define the baseline vacancy-detail flow so one structured vacancy record can be returned in stable detail form for later company management and approved student-discovery experiences.

## User story

As a company user and later as a student reviewer, I need a stable vacancy detail view so the platform can represent one job opportunity consistently before applications, bookmarks, and matching workflows.

## Functional requirements

### 1. Vacancy-detail scope

- This unit covers detail-form retrieval of a single vacancy only.
- The baseline should support:
  - returning one vacancy by identity in a stable detail shape
  - distinguishing visible, hidden, removed, or unauthorized vacancy states according to the requesting context
  - presenting structured fields needed to understand the vacancy fully
  - returning predictable not-found, no-visible-access, or inactive outcomes where appropriate
- Search filters, applications, bookmarks, and matching remain separate later units.

### 2. Access and visibility posture

- Vacancy detail may serve more than one later context, but access rules must remain explicit.
- Company-side vacancy detail should return company-owned vacancies in the authenticated company context.
- Later student or public job-detail experiences may consume only the appropriately visible subset of active vacancies and remain separate units.
- Hidden, draft, removed, or unauthorized vacancies must not appear as active detail records in contexts where they are not allowed.

### 3. Detail data and structured behavior

- Vacancy detail should consume a structured **Vacancy** record and later attached requirement records where allowed.
- The baseline should support detail fields such as title, summary or description, employment type, experience direction, location summary, and other structured vacancy metadata.
- Invalid visibility context, inconsistent active-versus-removed state, or malformed detail inputs must return stable outcomes rather than exposing conflicting or unauthorized records.
- Vacancy detail should remain detail-oriented and should not replace later application, bookmark, or matching views.

### 4. Stable detail outcomes

- The baseline should support stable outcomes for visible detail, hidden detail, removed or inactive vacancy, and not-found states.
- Detail behavior must remain aligned with the active-versus-removed posture defined by earlier vacancy CRUD units.
- Later implementation may refine related content, additional sections, or presentation density, but the baseline should already assume predictable detail behavior.
- Requirement-tag units may enrich what is shown in detail, but they should not redefine vacancy identity or visibility posture.

### 5. Frontend and API alignment

- Company-side vacancy detail belongs in an authenticated company route area; later student-facing job detail experiences remain separate units.
- The final API shape for vacancy detail may be refined later, but it must remain consistent with the existing versioned REST baseline and standard error envelopes.
- Vacancy-detail state should use global state only where shared shell or session context requires it; most detail state should remain local to the feature.

### 6. Relationship to later units

- Phase 8 job-list and search-detail-adjacent units may consume the visible vacancy-detail baseline without redefining active vacancy rules.
- Later application, bookmark, and matching units should depend on the same vacancy identity and visibility posture rather than inventing alternate detail records.
- U7-6 through U7-8 should enrich detail data through structured requirement records without collapsing into applications or matching logic.

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
- U7-4 vacancy list

## Outputs

- Baseline vacancy-detail flow
- Stable detail-shape and visibility expectations
- Integration expectations for later search, application, bookmark, and matching units

## User flow

1. A company management or later discovery context requests one vacancy by identity.
2. Backend evaluates the applicable visibility posture for that context and vacancy state.
3. The platform returns the stable visible detail shape or a predictable hidden, removed, or not-found outcome.
4. Frontend renders the resulting detail or unavailable state clearly.
5. Later search, application, bookmark, and matching units build on the same vacancy-detail baseline.

## Acceptance criteria

- Vacancy-detail behavior is documented clearly.
- Access posture, stable detail outcomes, and active-vacancy expectations are defined.
- Structured detail-field expectations are documented.
- The unit is kept separate from search filters, applications, bookmarks, and matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Search filters and query UX
- Applications, bookmarks, or matching logic
- Requirement-tag editing behavior
- Analytics or ranking logic
- Student-facing application flow
