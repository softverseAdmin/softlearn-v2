# Functional design: U14-2-practice-question-bank

## Purpose

Define the baseline practice-question-bank flow so students can browse and use a protected bank of practice questions separate from official scored exam attempts.

## User story

As a student, I need a practice-question bank so I can prepare for exams using reusable learning content without affecting official exam results.

## Functional requirements

### 1. Practice-question-bank scope

- This unit covers practice question bank only.
- The baseline should support:
  - presenting protected practice questions grouped by relevant exam or category context
  - keeping practice usage separate from official exam-attempt scoring and pass-fail records
  - supporting deterministic practice outcomes such as immediate explanation or correctness feedback where later allowed
  - returning stable outcomes when a practice bank is empty or restricted
- mock-exam execution, official exam submission, adaptive AI recommendations, heavy analytics, and admin authoring detail remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated students may use the practice-question bank in their protected learning experience.
- Practice content must not expose protected official answer keys or other students' activity.
- Authorized admins may manage practice-question content later through separate units.
- Practice use should remain traceable enough for later study-plan and performance aggregation.

### 3. Practice-question behavior

- Practice-question usage should remain separate from official exam attempts and should not alter scored exam history.
- The baseline may support immediate correctness or explanation feedback later, but those outcomes must remain deterministic and content-driven.
- Question-bank browsing should remain structured by category, exam context, or topic rather than by opaque recommendation logic.
- This unit should not claim adaptive AI behavior or external tutoring integration.

### 4. Frontend and API alignment

- The capability belongs in protected student-facing learning routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most preparation state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Preparation outcomes should remain deterministic, explainable, and easy to review later.

### 5. Relationship to later units

- U14-1 exam category may organize the practice-question bank for navigation.
- U14-3 mock exam should remain separate because it simulates a full timed or grouped exam experience.
- U14-4 study plan and U14-5 performance tracking may later consume practice usage evidence without redefining the practice bank itself.
- Official exam-taking and scoring units remain separate and must not be merged into this practice flow.

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
- U5-2 question-creation
- U5-3 answer-options-management
- U14-1 exam-category

## Outputs

- Baseline protected practice-question-bank flow
- Separation expectations between practice content and official exams
- Integration expectations for mock exam, study plan, and performance units

## User flow

1. A student opens a protected practice-question area.
2. Backend verifies student access and loads the allowed practice-question set for the selected category or topic.
3. The platform presents practice questions and any deterministic practice feedback allowed by policy.
4. The student receives stable practice outcomes without changing official exam records.
5. Later study-plan and performance units may reuse practice evidence collected from the same flow.

## Acceptance criteria

- Practice question bank behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Official exam submission, and Adaptive AI recommendations.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Official exam submission
- Adaptive AI recommendations
- Heavy analytics
- Admin authoring detail
