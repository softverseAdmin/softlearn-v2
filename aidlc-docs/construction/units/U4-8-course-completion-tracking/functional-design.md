# Functional design: U4-8-course-completion-tracking

## Purpose

Define the baseline course-completion flow so the platform can represent when a student has completed a course using structured, protected learning evidence derived from lesson progress.

## User story

As a student, I need course completion tracking so the platform can recognize when I finish a course and use that result consistently in later learning and employability features.

## Functional requirements

### 1. Course-completion scope

- This unit covers the course-level completion outcome for a student inside an enrollment context.
- The baseline should support:
  - determining whether a course is complete for a specific enrollment
  - storing or representing a structured **CourseCompletion** outcome
  - returning stable completion and non-completion outcomes
  - making the result available to later student-facing and rule-based downstream units
- Certificates, readiness scoring, and company visibility policy remain separate later units.

### 2. Ownership and protected-learning evidence

- Course completion is protected student learning data.
- A **CourseCompletion** outcome should belong to the student’s enrollment and corresponding course context.
- Company users must not see course-completion data unless later privacy and visibility units explicitly allow it.
- Admin access to completion records, if needed later, must remain purposeful, logged, and policy-bound.

### 3. Completion derivation behavior

- Course completion should be derived from the lesson structure and lesson-progress state rather than entered as arbitrary free text.
- The baseline should support a deterministic completion rule tied to the lessons required for a course.
- Repeated evaluation of the same lesson-progress state should produce the same course-completion outcome.
- Invalid or inconsistent source state must return stable outcomes rather than silently creating conflicting completion records.

### 4. Relationship to lesson progress and later matching

- Lesson progress is the primary source for course-completion calculation.
- This unit should not redefine lesson-level progress behavior.
- Later readiness and rule-based matching units may use course-completion evidence, but they must preserve explainability and privacy rules.

### 5. Frontend and route behavior

- Course-completion status belongs in the student learning area and should align with the shared route and layout baselines.
- Completion and in-progress states should be representable clearly to the student.
- Completion presentation should remain separate from company-facing visibility until later privacy and results-sharing rules define that behavior.

### 6. Relationship to later units

- Later learning-summary units should build on the course-completion baseline defined here.
- Later readiness and matching units may consume completion as deterministic evidence.
- Later company-facing results units must respect privacy and consent rules before exposing any completion-derived student data.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-3 role-based access control
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U4-6 course enrollment
- U4-7 lesson progress tracking

## Outputs

- Baseline course-completion flow
- Deterministic completion and protected-learning-evidence expectations
- Integration expectations for later learning summary, readiness, and visibility units

## User flow

1. Authenticated student accumulates lesson-progress state inside an enrolled course.
2. The platform evaluates whether the course’s completion rule has been satisfied.
3. Backend records or returns the structured course-completion outcome for that enrollment.
4. Frontend presents the resulting completion or in-progress state clearly to the student.
5. Later units may consume this completion evidence under the appropriate privacy and explainability rules.

## Acceptance criteria

- Course-completion behavior is documented clearly.
- Protected ownership and derivation expectations are defined.
- Relationship to lesson progress, later readiness, and later visibility rules is documented.
- The unit stays separate from certificates, readiness scoring, and company-facing exposure logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Certificate generation
- Readiness-score or match-score calculation
- Company-facing result exposure
- Manual override workflows
