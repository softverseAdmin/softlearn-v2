# Functional design: U5-4-exam-taking-ui

## Purpose

Define the baseline protected exam-taking UI flow so authenticated students can access, read, and navigate an available exam experience built from structured exam, question, and answer-option data.

## User story

As a student, I need a clear exam-taking interface so I can understand the exam content, move through questions, and prepare my responses in a protected assessment context.

## Functional requirements

### 1. Exam-taking UI scope

- This unit covers the student-facing interface for taking an available exam only.
- The baseline should support:
  - entering a protected exam-taking route for an available exam
  - presenting exam title, instructions, timing context, and question navigation
  - rendering question content and answer options clearly
  - allowing the student to move through questions and review current response state in the UI
  - presenting a clear handoff toward the later answer-submission flow
- Answer submission persistence, scoring, pass/fail logic, history, and retake policy remain separate later units.

### 2. Protected student access

- Exam-taking UI must be treated as a protected student action.
- Only authenticated students with access to the target exam should enter the exam-taking flow.
- Company users and admins should not use the student exam-taking UI as a substitute for management or review workflows.
- Exam access checks should align with authentication, authorization, and exam-integrity rules.

### 3. UI data and presentation behavior

- The exam-taking UI should consume structured **Exam**, **Question**, and **AnswerOption** data that is ready for student presentation.
- The baseline should support core interface elements such as exam header information, question area, navigation controls, response-selection controls, progress awareness, and timing context where applicable.
- Invalid or unavailable exam state, missing question data, or inconsistent option state must return stable student-facing outcomes rather than silently entering a broken exam experience.
- Correctness-sensitive metadata must not be exposed through the exam-taking UI.

### 4. Integrity and session posture

- The UI should preserve exam integrity by displaying only the data necessary for the student to take the exam.
- Exam-taking UI state must remain separate from score calculation, pass/fail outcomes, and later results presentation.
- The baseline may include local or transient response state for the active interface, but durable submission behavior belongs to the later answer-submission unit.
- Later implementation may refine anti-cheat or interruption handling, but the baseline should already assume protected and traceable exam access.

### 5. Frontend and route alignment

- The exam-taking UI belongs in a protected student route area aligned with the shared app-shell, routing, and session baselines.
- Exam-taking state should use global state only where session, identity, or shared shell context requires it; most active exam UI state should remain local to the feature.
- The final API interactions may be refined later, but the experience must remain consistent with the existing REST baseline and standard error envelopes.

### 6. Relationship to later units

- U5-5 answer submission should receive the student’s selected responses from the exam-taking experience and persist them through a controlled submission flow.
- U5-6 score calculation and U5-7 pass fail logic should consume the submitted attempt state rather than interpreting transient UI state directly.
- U5-8 exam history should later expose completed attempt summaries without redefining the active exam-taking experience.
- U5-9 exam retake policy should govern whether and when the student may re-enter this exam-taking flow for additional attempts.

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

## Outputs

- Baseline protected exam-taking UI flow
- Student access, presentation, and navigation expectations
- Integration expectations for later answer-submission, scoring, history, and retake units

## User flow

1. Authenticated student opens an available exam from the protected student area.
2. Frontend checks access and loads the exam-taking interface.
3. The interface presents exam instructions, questions, and answer options in a clear, navigable format.
4. The student moves through the exam and prepares responses in the active UI state.
5. The interface presents a clear transition into the later controlled answer-submission flow.

## Acceptance criteria

- Exam-taking UI behavior is documented clearly.
- Protected student access and exam-availability boundaries are defined.
- Structured presentation, navigation, and integrity expectations are documented.
- The unit is kept separate from answer submission, scoring, and results logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Admin authoring workflows
- Durable answer-submission persistence
- Score calculation or pass/fail rules
- Exam result summaries
- Retake-governance decisions beyond the baseline relationship to later units
