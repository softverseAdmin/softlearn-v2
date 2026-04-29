# Functional design: U6-1-student-learning-summary

## Purpose

Define the baseline protected student learning-summary flow so an authenticated student can review structured learning evidence derived from enrollments, lesson progress, and course completion in one coherent summary experience.

## User story

As a student, I need a learning summary so I can understand my current course participation, progress, and completion status without checking disconnected learning records one by one.

## Functional requirements

### 1. Learning-summary scope

- This unit covers the student-facing summary of learning-domain evidence only.
- The baseline should support:
  - opening a protected student learning-summary area
  - listing relevant courses or enrollments tied to the authenticated student
  - presenting structured progress and completion information derived from lesson progress and course completion state
  - showing stable summary states such as in progress, completed, or not started where appropriate
- Exam-result summaries, company-facing visibility, privacy filters, and readiness scoring remain separate later units.

### 2. Protected student ownership

- Learning summary must be treated as protected student learning data.
- Students may view only their own learning summary through this baseline.
- Company users must not view student learning summaries through this unit, and admin access must remain purposeful, logged, and policy-bound if needed later.
- Learning-summary access should align with privacy, consent, and audit expectations.

### 3. Summary data and presentation behavior

- Learning summary should consume structured **Enrollment**, **LessonProgress**, and **CourseCompletion** data tied to the student and course context.
- The baseline should support stable summary fields such as course identity, enrollment state, progress state, completion state, and high-level learning evidence indicators.
- Invalid ownership, missing enrollment context, or inconsistent progress-versus-completion state must return stable outcomes rather than exposing conflicting or unauthorized records.
- Learning summary should help the student understand learning status clearly without redefining the underlying progress or completion rules.

### 4. Privacy and visibility posture

- Student learning summary is student-owned and protected by default.
- Student-facing learning summary must remain separate from later company-facing visibility decisions.
- The baseline should support clear distinction between student-owned learning evidence and any future company-visible subset of results.
- Later implementation may refine filtering and richer detail views, but the baseline should already assume privacy-aware, traceable learning-summary access.

### 5. Frontend and API alignment

- The learning-summary flow belongs in a protected student route area aligned with the shared app-shell, routing, and session baselines.
- Learning-summary state should use global state only where session, identity, or shared shell context requires it; most summary data state should remain local to the feature.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U6-2 student exam results summary should remain a separate summary experience for assessment evidence rather than being merged into the learning summary baseline.
- U6-3 company view student results and U6-4 privacy filter for results must respect consent and visibility rules before exposing any learning-summary-derived data to companies.
- U6-5 readiness score calculation may consume learning summary evidence as a deterministic readiness input, but it must preserve explainability and privacy rules.
- Later dashboards or analytics units may build on the same protected summary baseline without redefining course progress or completion rules.

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
- U4-6 course enrollment
- U4-7 lesson progress tracking
- U4-8 course completion tracking

## Outputs

- Baseline protected student learning-summary flow
- Student ownership, presentation, and privacy expectations for learning evidence
- Integration expectations for later result-visibility and readiness-sensitive units

## User flow

1. Authenticated student opens the protected learning-summary area.
2. Frontend requests the student’s own enrollment, progress, and completion summary data.
3. Backend returns only authorized structured learning summary records allowed by the baseline.
4. The student reviews course participation, progress, and completion state in a stable summary view.
5. Later visibility-sensitive and readiness-sensitive units build on the same protected learning evidence.

## Acceptance criteria

- Student learning-summary behavior is documented clearly.
- Protected student ownership and privacy boundaries are defined.
- Structured summary, access, and traceability expectations are documented.
- The unit is kept separate from exam-result summaries, company-facing visibility, and readiness scoring logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Exam-result summaries
- Company-facing result views
- Readiness-score calculation
- Advanced analytics or dashboards
- Fine-grained company visibility rules
