# Functional design: U5-5-answer-submission

## Purpose

Define the baseline protected answer-submission flow so authenticated students can convert active exam responses into durable attempt data that later scoring, pass/fail, and history units can consume consistently.

## User story

As a student, I need a reliable answer-submission flow so the platform can record my exam responses clearly and use them for later evaluation without ambiguity.

## Functional requirements

### 1. Answer-submission scope

- This unit covers submission of student exam responses only.
- The baseline should support:
  - receiving a protected submission from an authenticated student for an allowed exam attempt
  - validating the submitted response payload against the available exam structure
  - recording a structured **ExamAttempt** and related **ExamAnswer** data with a stable outcome
  - marking the attempt state consistently for later scoring and history behavior
- Score calculation, pass/fail logic, exam history, and retake policy remain separate later units.

### 2. Protected student ownership

- Answer submission must be treated as a protected student action.
- Only the authenticated student who owns the active attempt context should be able to submit responses for that attempt.
- Company users and other students must not submit or modify another student’s exam responses.
- Answer submission should align with exam-integrity rules and create traceable student-owned attempt data.

### 3. Submission data and validation

- Answer submission should produce structured **ExamAttempt** and **ExamAnswer** records tied to the student and exam context.
- The baseline should support validation of question identifiers, answer-option identifiers where applicable, attempt eligibility, and request completeness according to the later finalized exam mode.
- Validation failures such as invalid question references, malformed answer-option identifiers, duplicate submissions for the same finalized attempt, or submissions against an unavailable exam state must return stable outcomes.
- Submission should capture enough traceable metadata for later scoring, pass/fail evaluation, history, and audit review without exposing correctness decisions at submission time.

### 4. Integrity and outcome posture

- Answer submission should finalize or persist the student’s responses in a controlled way that supports exam integrity.
- Submission behavior must remain separate from score calculation, pass/fail outcomes, and later result presentation.
- The baseline may support a stable submitted-attempt state even if scoring occurs later.
- Later implementation may refine draft-save, autosave, and interruption-recovery behavior, but the baseline should already assume traceable and reviewable submission outcomes.

### 5. Frontend and API alignment

- The answer-submission flow belongs at the boundary between the protected student exam-taking interface and backend attempt persistence.
- Submission behavior must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most temporary response state should remain local to the exam-taking experience until converted into durable attempt data through controlled submission.

### 6. Relationship to later units

- U5-6 score calculation should consume submitted attempt and answer data rather than transient UI state.
- U5-7 pass fail logic should use the scored attempt outcome without redefining submission ownership or finalization rules.
- U5-8 exam history should expose later summaries of submitted attempts using the same student-owned attempt records.
- U5-9 exam retake policy should use submitted-attempt state when determining future retake eligibility.

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
- U5-1 exam creation
- U5-2 question creation
- U5-3 answer options management
- U5-4 exam taking UI

## Outputs

- Baseline protected answer-submission flow
- Student ownership, validation, and traceability expectations
- Integration expectations for later scoring, pass/fail, history, and retake units

## User flow

1. Authenticated student completes or stops at a chosen point in the protected exam-taking experience.
2. Frontend sends the student’s selected responses through the controlled answer-submission flow.
3. Backend validates the submission against the exam structure and attempt rules.
4. The platform records the structured attempt and answer data with a stable submitted outcome.
5. Later scoring, pass/fail, history, and retake units consume the submitted attempt state.

## Acceptance criteria

- Answer-submission behavior is documented clearly.
- Protected student ownership and attempt-traceability boundaries are defined.
- Structured submission, validation, and integrity expectations are documented.
- The unit is kept separate from scoring, pass/fail, and result-visibility logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Admin authoring workflows
- Question or answer-option definition workflows
- Score calculation or pass/fail rules
- Exam result summaries
- Retake-governance decisions beyond the baseline relationship to later units
