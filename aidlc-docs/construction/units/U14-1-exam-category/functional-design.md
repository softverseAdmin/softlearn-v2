# Functional design: U14-1-exam-category

## Purpose

Define the baseline exam-category flow so preparation experiences can organize exams and related study assets into stable student-facing categories.

## User story

As a student, I need exam categories so I can understand how preparation materials and practice flows are organized.

## Functional requirements

### 1. Exam-category scope

- This unit covers exam category only.
- The baseline should support:
  - presenting stable exam categories for preparation and study flows
  - associating existing exams and preparation content to those categories
  - supporting category-based filtering or grouping in later student preparation views
  - returning stable outcomes when categories have no available preparation content
- practice-question delivery, mock-exam execution, personalized recommendations, heavy analytics, and admin category-management detail remain separate later units.

### 2. Authorization and visibility behavior

- Students may view categories for preparation purposes within their protected learning experience.
- Authorized platform operators may manage category definitions later through separate admin units.
- Category presentation must not expose hidden exam content or protected answer data.
- Category use in preparation flows should remain auditable enough for support and content governance.

### 3. Exam-category behavior

- Exam categories should act as stable organizational metadata rather than a new scoring or visibility system.
- The baseline should support category summaries that help students browse preparation options without revealing protected exam internals.
- Category definitions should remain consistent across practice-question, mock-exam, study-plan, and performance-tracking units.
- This unit should not create actual preparation attempts or change existing exam outcomes.

### 4. Frontend and API alignment

- The capability belongs in protected student-facing learning routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most preparation state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Preparation outcomes should remain deterministic, explainable, and easy to review later.

### 5. Relationship to later units

- Later practice-question-bank and mock-exam units may use categories as navigation or grouping input.
- Study-plan and performance-tracking units may aggregate preparation evidence by category without redefining category semantics.
- Admin exam-management units may later maintain categories without changing the student-facing category baseline.
- No external AI or recommendation service should be introduced through category handling.

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
- U5-1 exam-creation
- U5-2 question-creation
- U5-8 exam-history

## Outputs

- Baseline exam-category organization model for preparation flows
- Student-facing category grouping expectations
- Integration expectations for later practice, mock, study-plan, and performance units

## User flow

1. A student opens an exam-preparation area that groups content by category.
2. Backend loads the allowed exam categories and associated preparation summaries.
3. The platform returns category groupings and any stable empty-category outcomes.
4. The student uses the categories to navigate preparation content.
5. Later preparation units reuse the same category organization baseline.

## Acceptance criteria

- Exam category behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Practice-question answering, and Mock-exam execution.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Practice-question answering
- Mock-exam execution
- Personalized recommendations
- Heavy analytics
