# Functional design: U6-3-company-view-student-results

## Purpose

Define the baseline protected company-side student-results view so authorized company users can review a permitted subset of student learning and exam evidence in approved candidate-review contexts.

## User story

As a company reviewer, I need a controlled view of allowed student results so I can understand relevant learning and assessment evidence without seeing hidden or disallowed student data.

## Functional requirements

### 1. Company-results-view scope

- This unit covers company-facing access to allowed student result evidence only.
- The baseline should support:
  - opening a protected company-side student-results view in an approved workflow context
  - presenting only the allowed subset of student learning-summary and exam-results-summary evidence
  - showing structured result summaries in understandable terms for company review
  - returning stable outcomes when no result data is available or visible
- Privacy filtering, readiness scoring, and broader company candidate-review workflows remain separate later units.

### 2. Protected company access

- Company-side student-results viewing must be treated as a protected company action.
- Only authenticated company users with an approved relationship or allowed review context should access this view.
- Company users must not use this baseline to browse hidden student data, another company’s candidate records, or unrestricted platform-wide result data.
- Company access to student results must remain policy-bound, consent-aware, and auditable.

### 3. Result data and presentation behavior

- Company-side student-results view should consume structured learning-summary and exam-results-summary evidence that has already been normalized for company review.
- The baseline should support stable summary fields such as course-completion evidence, progress indicators where allowed, exam outcome indicators where allowed, and enough context to interpret the evidence responsibly.
- Invalid access context, missing authorization, absent consent, or inconsistent visibility state must return stable outcomes rather than exposing conflicting or unauthorized records.
- Company-side result presentation should avoid revealing protected raw internals, hidden attempt details, or broader student history beyond the allowed result summary.

### 4. Privacy and consent posture

- Company-visible student results must be treated as a filtered subset of protected student data rather than a separate public data domain.
- The baseline should assume result visibility depends on student privacy settings, approved policy, and contextual authorization together.
- Exam results must not be exposed to companies unless the applicable privacy and consent rules allow it.
- Later privacy-filter logic may refine exact field- and summary-level visibility, but the baseline should already assume restricted, explainable, and auditable company access.

### 5. Frontend and API alignment

- The company-side student-results view belongs in a protected company route area aligned with the shared app-shell, routing, and session baselines.
- Result-view state should use global state only where session, company identity, or shared shell context requires it; most candidate-result view state should remain local to the feature.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U6-4 privacy filter for results should define the exact filtering behavior that determines which learning and exam result fields are visible in this company-facing view.
- U6-5 readiness score calculation may later consume student learning and exam evidence, but it must not bypass the visibility and consent rules governing company-facing result access.
- Later company candidate-review and matching units may build on the same protected result-view baseline without redefining company authorization or privacy boundaries.
- Student-facing summaries remain the source baselines for student-owned evidence and must not be reinterpreted here as unrestricted company data.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U2-10 student profile privacy settings
- U6-1 student learning summary
- U6-2 student exam results summary

## Outputs

- Baseline protected company-side student-results view
- Authorization, visibility, and audit expectations for company result access
- Integration expectations for later privacy-filter and readiness-sensitive units

## User flow

1. Authenticated company user enters an approved candidate-review context.
2. Frontend requests company-visible student result summaries for the allowed student context.
3. Backend checks company authorization, applicable privacy settings, and allowed visibility posture.
4. The platform returns only the permitted structured student result summaries or a stable no-access or no-visible-data outcome.
5. Later privacy-filter and readiness-sensitive units build on the same protected company-access baseline.

## Acceptance criteria

- Company-side student-results view behavior is documented clearly.
- Protected company authorization, privacy, and consent boundaries are defined.
- Structured summary, access, and audit expectations are documented.
- The unit is kept separate from privacy-filter rule definition and readiness scoring logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Detailed privacy-filter rule evaluation
- Readiness-score calculation
- Unrestricted company candidate browsing
- Advanced analytics or dashboards
- Final per-field visibility matrix
