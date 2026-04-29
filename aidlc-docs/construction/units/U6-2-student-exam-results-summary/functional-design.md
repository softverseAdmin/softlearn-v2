# Functional design: U6-2-student-exam-results-summary

## Purpose

Define the baseline protected student exam-results-summary flow so an authenticated student can review structured exam outcomes derived from attempt history, score calculation, and pass/fail classification in one coherent summary experience.

## User story

As a student, I need an exam-results summary so I can understand my assessment outcomes without checking disconnected attempt records one by one.

## Functional requirements

### 1. Exam-results-summary scope

- This unit covers the student-facing summary of exam-domain outcomes only.
- The baseline should support:
  - opening a protected student exam-results-summary area
  - listing relevant exam attempts or exam-level result groupings tied to the authenticated student
  - presenting structured result information derived from exam history, score state, and pass/fail state
  - showing stable summary states such as submitted, scored, passed, or not passed where appropriate
- Company-facing visibility, privacy filters for external sharing, and readiness scoring remain separate later units.

### 2. Protected student ownership

- Exam-results summary must be treated as protected student assessment data.
- Students may view only their own exam-results summary through this baseline.
- Company users must not view student exam results through this unit, and admin access must remain purposeful, logged, and policy-bound if needed later.
- Exam-results-summary access should align with privacy, consent, and audit expectations.

### 3. Summary data and presentation behavior

- Exam-results summary should consume structured **ExamAttempt**, score, and pass/fail outcome data tied to the student and exam context.
- The baseline should support stable summary fields such as exam identity, attempt timing, score state, pass/fail state, and high-level assessment evidence indicators.
- Invalid ownership, missing attempt context, or inconsistent score-versus-outcome state must return stable outcomes rather than exposing conflicting or unauthorized records.
- Exam-results summary should help the student understand assessment outcomes clearly without redefining scoring or pass/fail rules.

### 4. Privacy and visibility posture

- Student exam-results summary is student-owned and protected by default.
- Student-facing exam-results summary must remain separate from later company-facing visibility decisions.
- The baseline should support clear distinction between student-owned assessment evidence and any future company-visible subset of results.
- Later implementation may refine filtering and richer detail views, but the baseline should already assume privacy-aware, traceable exam-results-summary access.

### 5. Frontend and API alignment

- The exam-results-summary flow belongs in a protected student route area aligned with the shared app-shell, routing, and session baselines.
- Exam-results-summary state should use global state only where session, identity, or shared shell context requires it; most summary data state should remain local to the feature.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U6-3 company view student results and U6-4 privacy filter for results must respect consent and visibility rules before exposing any exam-results-summary-derived data to companies.
- U6-5 readiness score calculation may consume exam summary evidence as a deterministic readiness input, but it must preserve explainability and privacy rules.
- Later student dashboards may build on the same protected exam-results summary baseline without redefining attempt, score, or pass/fail rules.
- Learning summaries remain a separate baseline so course progress and exam outcomes do not collapse into one ambiguous record type.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U5-6 score calculation
- U5-7 pass fail logic
- U5-8 exam history

## Outputs

- Baseline protected student exam-results-summary flow
- Student ownership, presentation, and privacy expectations for assessment evidence
- Integration expectations for later visibility-sensitive and readiness-sensitive units

## User flow

1. Authenticated student opens the protected exam-results-summary area.
2. Frontend requests the student’s own exam-attempt outcome summary data.
3. Backend returns only authorized structured exam result summary records allowed by the baseline.
4. The student reviews exam outcomes, score state, and pass/fail state in a stable summary view.
5. Later visibility-sensitive and readiness-sensitive units build on the same protected assessment evidence.

## Acceptance criteria

- Student exam-results-summary behavior is documented clearly.
- Protected student ownership and privacy boundaries are defined.
- Structured summary, access, and traceability expectations are documented.
- The unit is kept separate from company-facing visibility, privacy filtering, and readiness scoring logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Company-facing result views
- Privacy filter enforcement for company access
- Readiness-score calculation
- Advanced analytics or dashboards
- Fine-grained company visibility rules
