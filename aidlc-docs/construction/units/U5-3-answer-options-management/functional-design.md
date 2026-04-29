# Functional design: U5-3-answer-options-management

## Purpose

Define the baseline protected answer-options management flow so authorized platform operators can maintain structured candidate answers for an existing question that later exam-taking, submission, and scoring units can consume consistently.

## User story

As an authorized platform operator, I need answer-options management so the platform can define structured answer choices for objective questions without relying on ad hoc option records.

## Functional requirements

### 1. Answer-options scope

- This unit covers management of answer-option records for an existing question only.
- The baseline should support:
  - opening a protected answer-options management flow for a chosen question
  - adding answer options when the question type requires them
  - updating option text or labels, ordering, and correctness-related metadata
  - removing or deactivating options when allowed by later implementation rules
  - validating the resulting answer-option set and returning stable outcomes
- Exam creation, question creation, exam taking, answer submission, scoring, pass/fail logic, history, and retake policy remain separate later units.

### 2. Protected authoring access

- Answer-options management must be treated as a protected platform-management action.
- Students and company users must not manage answer options through this baseline.
- The baseline should assume admin or similarly authorized internal content-management access, aligned with secure-by-default admin rules.
- Changes to answer options and correctness-related metadata are integrity-sensitive and should remain auditable.

### 3. Answer-option data and validation

- Answer-options management should produce structured **AnswerOption** records linked to an existing **Question**.
- The baseline should support core option fields such as option content, display order, active state, and correctness-ready metadata needed by later scoring units.
- Validation failures such as missing required option content, malformed ordering values, unsupported option sets for the question type, duplicate options, or orphaned question references must return stable outcomes.
- Correctness-related metadata must remain protected and must not be exposed through student-facing contexts at authoring time.

### 4. Integrity and visibility posture

- Answer-options management should define candidate responses without exposing answer correctness beyond authorized authoring contexts.
- Answer-option records must remain separate from student attempt data, submitted answers, scores, and pass/fail outcomes.
- Student-facing rendering should depend on later approved exam-taking behavior rather than being assumed automatically at option-management time.
- Company-facing access to exam outcomes remains governed by later privacy and results-visibility units and must not be implied by answer-option authoring behavior.

### 5. Frontend and API alignment

- The protected answer-options management flow belongs in a protected platform-management route area rather than the student learning area.
- The final API shape for answer-options management may be detailed later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most option-management state should remain local to the feature rather than promoted to global state unless reuse is justified later.

### 6. Relationship to later units

- U5-4 exam taking UI should render only appropriately assembled question and answer-option sets.
- U5-5 answer submission should use the same question and answer-option identities when recording student responses.
- U5-6 score calculation should use the same protected correctness-ready metadata rather than redefining option correctness elsewhere.
- Later exam-management units may expand richer authoring, import flows, and moderation controls without redefining the answer-options baseline.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U5-1 exam creation
- U5-2 question creation

## Outputs

- Baseline protected answer-options management flow
- Option-authoring access and validation expectations
- Integration expectations for later exam-taking, submission, and scoring units

## User flow

1. Authorized platform operator opens the protected answer-options area for an existing question.
2. Frontend presents the current option set and the controls required to add, reorder, update, or remove options.
3. Operator manages the option set and submits the changes.
4. Backend validates the request and records the structured answer-option set linked to the target question with a stable outcome.
5. The resulting option set becomes available for later controlled exam delivery, answer submission, and scoring when allowed by later units.

## Acceptance criteria

- Answer-options management behavior is documented clearly.
- Protected authoring access is defined and separated from student and company actions.
- Structured answer-option expectations, validation outcomes, and integrity-sensitive posture are documented.
- The unit is kept separate from exam taking, scoring, and results logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Exam or question creation workflows
- Student exam-taking flows
- Score calculation or pass/fail rules
- Company-facing results exposure
- Publication moderation or review workflows beyond the baseline protected posture
