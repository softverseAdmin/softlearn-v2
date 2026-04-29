# Functional design: U14-5-performance-tracking

## Purpose

Define the baseline preparation-performance-tracking flow so students can review deterministic preparation metrics derived from practice, mock, and study-plan evidence.

## User story

As a student, I need preparation performance tracking so I can understand my progress and weak areas while keeping the metrics explainable and under my control.

## Functional requirements

### 1. Performance-tracking scope

- This unit covers performance tracking only.
- The baseline should support:
  - tracking preparation performance using deterministic inputs from practice, mock exams, and study-plan progress
  - presenting stable summary metrics by category, activity type, or recent trend without heavy analytics engines
  - preserving clear separation between preparation metrics and official exam results
  - returning stable outcomes when little or no preparation evidence exists
- heavy analytics, AI predictions, company-facing visibility by default, coaching workflows, and external reporting services remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated students may view detailed preparation performance by default.
- Preparation metrics must remain student-owned and must not be shared with companies unless later consent and visibility rules explicitly allow it.
- Performance tracking should remain explainable and deterministic.
- Metric generation should remain auditable because later dashboards and study flows may depend on it.

### 3. Performance-tracking behavior

- The baseline should support category-level, activity-level, or trend-level summaries derived from approved preparation evidence only.
- Preparation-performance metrics should remain clearly separate from official exam scores, pass-fail records, and readiness scoring.
- No heavy analytics engine, AI prediction, or opaque ranking should be introduced in this unit.
- Performance outputs should remain stable enough for later dashboard summaries and study-plan feedback.

### 4. Frontend and API alignment

- The capability belongs in protected student-facing learning routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most preparation state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Preparation outcomes should remain deterministic, explainable, and easy to review later.

### 5. Relationship to later units

- U14-2 practice-question bank, U14-3 mock exam, and U14-4 study plan supply the inputs used here.
- Later dashboard units may aggregate preparation-performance metrics at a high level without redefining the underlying measurement rules.
- Privacy and consent units must govern any future sharing of preparation metrics beyond the student-owned context.
- Notification units may later remind students about performance trends without altering metric definitions.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-4 base API structure
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U14-2 practice-question-bank
- U14-3 mock-exam
- U14-4 study-plan

## Outputs

- Baseline deterministic preparation-performance-tracking flow
- Student-owned preparation metric expectations
- Integration expectations for dashboards, privacy rules, and notifications

## User flow

1. A student opens preparation performance tracking in the protected learning area.
2. Backend gathers approved preparation evidence from practice sessions, mock exams, and study-plan progress.
3. The platform computes deterministic preparation metrics and category summaries.
4. The student receives a stable preparation-performance view distinct from official exam results.
5. Later dashboards and reminders may reuse the same metric posture without changing its rules.

## Acceptance criteria

- Performance tracking behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Heavy analytics engines, and AI predictions.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Heavy analytics engines
- AI predictions
- Default company-facing sharing
- External reporting services
