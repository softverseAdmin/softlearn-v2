# Functional design: U11-2-view-student-learning-record

## Purpose

Define the baseline company-side student-learning-record view so authorized company users can review the permitted subset of a student's learning history in approved candidate-review contexts.

## User story

As an authorized company user, I need a controlled view of a student's learning record so I can understand relevant course evidence without seeing hidden or unrelated student data.

## Functional requirements

### 1. View-student-learning-record scope

- This unit covers view student learning record only.
- The baseline should support:
  - opening a protected learning-record view from an approved company review context
  - presenting the allowed subset of course participation, lesson progress, and completion evidence in structured summary form
  - returning stable outcomes when no learning data is visible or available
  - preserving a consistent result shape for later readiness, shortlist, and dashboard workflows
- exam-result review, shortlist management, candidate notes, dashboard aggregation, and analytics expansion remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated company users with approved company-side candidate context may access the learning-record view.
- Learning-record access must remain constrained by privacy settings, consent posture, and company boundary rules.
- Company users must not use this unit to browse unrestricted platform-wide learning records.
- Access decisions and visible record categories should remain auditable.

### 3. Learning-record behavior

- The view should consume structured learning evidence that has already been normalized for company review.
- The baseline should support allowed summary fields such as enrollments, progress indicators, course-completion evidence, and category-level context where policy permits it.
- Hidden or disallowed learning evidence must remain withheld while preserving a stable response shape.
- This unit should not calculate readiness scores or expose raw learning internals beyond the approved company-facing summary.

### 4. Frontend and API alignment

- The capability belongs in protected company-side routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most candidate-review state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Deterministic, explainable, and auditable review outcomes should be preserved.

### 5. Relationship to later units

- U6-1 student learning summary remains the student-owned source baseline for learning evidence.
- U6-4 privacy filter for results and later U16 visibility units must govern what learning-record content companies may see.
- U11-3 remains the separate company-side exam-result unit.
- Later dashboard and analytics units may consume the same allowed summary posture without bypassing its restrictions.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U4-6 course enrollment
- U4-7 lesson progress tracking
- U4-8 course completion tracking
- U6-1 student learning summary
- U6-3 company view student results
- U6-4 privacy filter for results
- U10-4 company-view-applications

## Outputs

- Baseline protected company-side learning-record view
- Allowed learning-summary expectations for candidate review
- Integration expectations for later readiness, shortlist, and dashboard units

## User flow

1. An authorized company user opens a student's learning record from an approved review context.
2. Backend verifies session, company relationship, and applicable privacy and consent posture.
3. The platform gathers only the allowed learning summaries and completion evidence.
4. The company user receives the filtered learning record or a stable restricted or empty outcome.
5. Later review and reporting units build on the same filtered learning posture.

## Acceptance criteria

- View student learning record behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Exam-result presentation, and Readiness-score calculation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Exam-result presentation
- Readiness-score calculation
- Heavy analytics
- Unrestricted company browsing
