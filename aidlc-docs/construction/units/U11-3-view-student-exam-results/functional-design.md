# Functional design: U11-3-view-student-exam-results

## Purpose

Define the baseline company-side student-exam-results view so authorized company users can review only the exam evidence explicitly allowed by privacy, consent, and company-review policy.

## User story

As an authorized company user, I need a controlled view of allowed student exam results so I can understand relevant assessment evidence without seeing protected attempt details.

## Functional requirements

### 1. View-student-exam-results scope

- This unit covers view student exam results only.
- The baseline should support:
  - opening a protected exam-results view from an approved company review context
  - presenting only the allowed subset of exam outcome summaries and category-level evidence
  - returning stable outcomes when exam data is hidden, unavailable, or partially visible
  - preserving a consistent result shape for later candidate-review and dashboard workflows
- learning-record presentation, dashboard analytics expansion, shortlist actions, interview workflows, and unrestricted exam browsing remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated company users with approved review context may access company-visible exam-result summaries.
- Exam-result visibility must remain stricter than general profile access and must always honor applicable privacy and consent rules.
- Company users must not see raw answer details, hidden attempt histories, or protected scoring internals through this unit.
- All access decisions should remain auditable because exam evidence is sensitive.

### 3. Exam-result behavior

- The view should consume structured exam evidence that has already been normalized for company review.
- The baseline should support allowed summary fields such as pass or fail outcome, score bands where permitted, relevant exam categories, and attempt-summary context where policy allows it.
- Hidden exam evidence must remain withheld while preserving a stable response shape and explainable restricted outcome.
- This unit must not calculate new scoring, alter existing results, or expose protected answer-level detail.

### 4. Frontend and API alignment

- The capability belongs in protected company-side routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most candidate-review state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Deterministic, explainable, and auditable review outcomes should be preserved.

### 5. Relationship to later units

- U6-2 student exam results summary remains the student-owned source baseline for exam evidence.
- U6-4 privacy filter for results and later U16 consent and visibility units must govern what exam-result content companies may see.
- U11-2 remains the separate company-side learning-record unit.
- Later dashboard, analytics, and candidate-review units may consume this filtered exam posture without bypassing it.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U5-6 score calculation
- U5-7 pass-fail logic
- U5-8 exam history
- U6-2 student exam results summary
- U6-3 company view student results
- U6-4 privacy filter for results
- U10-4 company-view-applications

## Outputs

- Baseline protected company-side exam-results view
- Allowed exam-summary expectations for candidate review
- Integration expectations for later dashboards and permission-sensitive units

## User flow

1. An authorized company user opens a student's exam-results view from an approved candidate-review context.
2. Backend verifies company context and the privacy and consent posture governing exam visibility.
3. The platform gathers only the allowed exam summaries and permitted category-level evidence.
4. The company user receives the filtered exam-result view or a stable restricted or empty outcome.
5. Later review and reporting units reuse the same company-safe exam posture.

## Acceptance criteria

- View student exam results behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Answer-level attempt detail, and Score recalculation.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Answer-level attempt detail
- Score recalculation
- Readiness-score calculation
- Unrestricted company exam browsing
