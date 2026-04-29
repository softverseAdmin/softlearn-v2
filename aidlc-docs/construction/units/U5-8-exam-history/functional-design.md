# Functional design: U5-8-exam-history

## Purpose

Define the baseline protected exam-history flow so students can review structured summaries of their own exam attempts, scores, and pass/fail outcomes in a consistent and privacy-aware way.

## User story

As a student, I need exam history so I can review my prior attempts and outcomes without relying on incomplete or conflicting result records.

## Functional requirements

### 1. Exam-history scope

- This unit covers student-facing access to exam-attempt history only.
- The baseline should support:
  - opening a protected exam-history area for the authenticated student
  - listing the student’s own exam attempts in a stable order
  - presenting structured attempt summary fields such as exam identity, attempt timing, score state, and pass/fail outcome where available
  - allowing the student to inspect an attempt summary or detail level appropriate to the baseline
- Retake policy, company-facing result visibility, and advanced analytics remain separate later units.

### 2. Protected student ownership

- Exam history must be treated as protected student assessment data.
- Students may view only their own exam-attempt history through this baseline.
- Company users must not view exam history through this unit, and admins must remain purposeful, logged, and policy-bound if they access such records later.
- Exam-history access should align with privacy, consent, and audit expectations.

### 3. History data and presentation behavior

- Exam history should consume structured **ExamAttempt**, score, and pass/fail outcome data tied to the student and exam context.
- The baseline should support stable attempt summaries even when some later-friendly fields, such as richer analytics or review notes, are not yet present.
- Invalid ownership, missing attempt context, or inconsistent result state must return stable outcomes rather than exposing conflicting or unauthorized records.
- History presentation should avoid revealing protected exam internals beyond what the student needs to understand their own attempt outcomes.

### 4. Privacy and visibility posture

- Exam history is student-owned and protected by default.
- Student-facing history must remain separate from later company-facing visibility decisions.
- The baseline should support clear distinction between available attempt data and any future result-sharing permissions.
- Later implementation may refine filtering and detail views, but the baseline should already assume privacy-aware, traceable exam-history access.

### 5. Frontend and API alignment

- The exam-history flow belongs in a protected student route area aligned with the shared app-shell, routing, and session baselines.
- Exam-history state should use global state only where session, identity, or shared shell context requires it; most history data state should remain local to the feature.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U5-9 exam retake policy should use the same attempt-history records when determining future exam eligibility.
- Later student exam-results summary units may build on the same protected history baseline rather than inventing alternate result records.
- Later company-facing result visibility units must respect privacy and consent rules before exposing any exam-history-derived information.
- Later readiness and matching units may use exam outcomes as explainable evidence under the appropriate privacy and visibility rules.

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
- U5-5 answer submission
- U5-6 score calculation
- U5-7 pass fail logic

## Outputs

- Baseline protected exam-history flow
- Student ownership, presentation, and privacy expectations
- Integration expectations for later retake, results-summary, and visibility-sensitive units

## User flow

1. Authenticated student opens the protected exam-history area.
2. Frontend requests the student’s own exam-attempt records.
3. Backend returns only authorized structured attempt summaries and detail data allowed by the baseline.
4. The student reviews attempt history, score state, and pass/fail outcomes where available.
5. Later retake and visibility-sensitive units build on the same protected history records.

## Acceptance criteria

- Exam-history behavior is documented clearly.
- Protected student ownership and privacy boundaries are defined.
- Structured summary, access, and traceability expectations are documented.
- The unit is kept separate from retake policy and company-facing result visibility logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Company-facing result views
- Retake-governance decisions
- Advanced analytics or dashboards
- Score-calculation internals
- Pass/fail rule definition
