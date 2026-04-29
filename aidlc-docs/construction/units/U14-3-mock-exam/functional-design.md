# Functional design: U14-3-mock-exam

## Purpose

Define the baseline mock-exam flow so students can take a preparation-focused simulated exam experience that remains separate from official scored exam attempts.

## User story

As a student, I need mock exams so I can practice under exam-like conditions without affecting official exam records.

## Functional requirements

### 1. Mock-exam scope

- This unit covers mock exam only.
- The baseline should support:
  - starting a mock exam built from approved preparation question sets
  - preserving mock-exam state and mock result evidence separately from official attempts
  - supporting deterministic mock scoring and summary outcomes where later allowed
  - returning stable outcomes when a mock exam is unavailable or incomplete
- official exam submission, adaptive AI difficulty, proctoring, heavy analytics, and external exam delivery services remain separate later units.

### 2. Authorization and visibility behavior

- Only authenticated students may access mock exams in their protected learning experience.
- Mock-exam data must remain student-owned and separate from official exam result exposure.
- Mock-exam content must not expose protected official answer keys beyond what the preparation policy allows.
- Mock attempts should remain traceable for later study-plan and performance use.

### 3. Mock-exam behavior

- A mock exam should simulate an exam-like preparation experience without becoming an official scored exam attempt.
- Mock results should remain deterministic and clearly labeled as preparation evidence rather than platform certification evidence.
- The baseline may support timed or grouped question behavior later, but the main concern here is separation from official exam history.
- This unit must not alter pass-fail records or official exam retake policy state.

### 4. Frontend and API alignment

- The capability belongs in protected student-facing learning routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most preparation state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Preparation outcomes should remain deterministic, explainable, and easy to review later.

### 5. Relationship to later units

- U14-2 practice question bank remains the reusable content source and lighter-weight preparation flow.
- U14-4 study plan and U14-5 performance tracking may later consume mock-exam evidence as preparation signals.
- Official exam-taking, scoring, and pass-fail units remain separate and must not be merged into mock-exam behavior.
- No external AI, proctoring provider, or remote exam platform should be introduced through this unit.

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
- U5-4 exam-taking-ui
- U5-6 score-calculation
- U5-8 exam-history
- U14-2 practice-question-bank

## Outputs

- Baseline protected mock-exam flow
- Separation expectations between mock results and official exam results
- Integration expectations for study-plan and performance-tracking units

## User flow

1. A student starts an available mock exam in the protected preparation area.
2. Backend verifies student access and loads the approved mock-exam question set.
3. The platform records mock progress and produces deterministic mock results when the attempt ends.
4. The student receives a mock-exam summary clearly separated from official exam records.
5. Later study-plan and performance units may reuse mock evidence without changing official exam behavior.

## Acceptance criteria

- Mock exam behavior is documented clearly.
- Authorization, privacy, and role boundaries are defined where applicable.
- Structured data, lifecycle, and integration expectations are documented.
- The unit stays separate from Concrete frontend or backend implementation code, Official exam submission, and Adaptive AI difficulty.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Official exam submission
- Adaptive AI difficulty
- Proctoring
- External exam delivery services
