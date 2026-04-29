# Functional design: U14-4-study-plan

## Purpose

Define the baseline study-plan flow so students can organize preparation work into a structured plan based on deterministic category, practice, and mock-exam inputs.

## User story

As a student, I need a structured study plan so I can organize my preparation work and track what to study next without relying on opaque recommendations.

## Functional requirements

### 1. Study-plan scope

- This unit covers study plan only.
- The baseline should support:
  - creating or presenting a structured study plan tied to exam categories and available preparation content
  - using deterministic preparation inputs such as category coverage, practice usage, and mock-exam evidence
  - supporting stable plan sections, progress states, and next-step guidance
  - returning stable outcomes when preparation evidence is limited or the student has no active plan
- AI recommendations, heavy analytics, calendar integration, shared coaching workflows, and automated tutoring services remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated students may view or update their own study plan.
- Study-plan data must remain student-owned and must not be exposed to companies unless later rules explicitly allow derived summaries.
- Plan generation should remain deterministic and explainable.
- Study-plan changes should remain traceable enough for support and performance review.

### 3. Study-plan behavior

- The baseline should support a structured plan derived from approved preparation evidence and exam categories rather than opaque recommendation logic.
- Plan sections may later include topic focus, mock-exam goals, and practice targets, but they should remain explainable and deterministic.
- The study plan should not alter official exam outcomes or replace student control over preparation choices.
- This unit must not introduce real AI, ML, or external recommendation services.

### 4. Frontend and API alignment

- The capability belongs in protected student-facing learning routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most preparation state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Preparation outcomes should remain deterministic, explainable, and easy to review later.

### 5. Relationship to later units

- U14-1, U14-2, and U14-3 provide the deterministic preparation inputs used by the study plan.
- U14-5 performance tracking may later measure progress against study-plan expectations without redefining plan semantics.
- Dashboard units may later summarize student study-plan progress in aggregate without exposing protected detail broadly.
- Notification units may later remind students about plan milestones without changing plan generation rules.

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
- U14-1 exam-category
- U14-2 practice-question-bank
- U14-3 mock-exam

## Outputs

- Baseline deterministic study-plan flow
- Student-owned planning and progress expectations
- Integration expectations for performance tracking, dashboards, and notifications

## User flow

1. A student opens or requests a preparation study plan in the protected learning area.
2. Backend gathers deterministic preparation evidence such as category coverage, practice usage, and mock-exam results.
3. The platform returns a structured study plan with stable next-step guidance and progress states.
4. The student reviews or updates the plan without affecting official exam records.
5. Later performance, dashboard, and notification units reuse the same deterministic study-plan posture.

## Acceptance criteria

- Study plan behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, AI recommendations, and Calendar integration.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- AI recommendations
- Calendar integration
- Shared coaching workflows
- Automated tutoring services
