# Functional design: U5-2-question-creation

## Purpose

Define the baseline protected question-creation flow so authorized platform operators can add structured questions to an existing exam that later answer-option, delivery, submission, and scoring units can consume consistently.

## User story

As an authorized platform operator, I need question creation so the platform can define the assessment content inside an exam without relying on ad hoc question records.

## Functional requirements

### 1. Question-creation scope

- This unit covers creation of question records for an existing exam only.
- The baseline should support:
  - opening a protected question-creation flow for a chosen exam
  - entering required question information
  - validating the submitted question definition
  - creating a structured **Question** record with a stable outcome
- Exam creation, answer-options management, exam taking, answer submission, scoring, pass/fail logic, history, and retake policy remain separate later units.

### 2. Protected authoring access

- Question creation must be treated as a protected platform-management action.
- Students and company users must not create questions through this baseline.
- The baseline should assume admin or similarly authorized internal content-management access, aligned with secure-by-default admin rules.
- Question-definition changes are integrity-sensitive and should remain auditable.

### 3. Question data and validation

- Question creation should produce a structured **Question** record linked to an existing **Exam**.
- The baseline should support core question fields such as prompt or stem, question type, display order, optional instructions, and scoring-ready metadata needed by later units.
- Validation failures such as missing required fields, malformed ordering values, unsupported question types, or orphaned exam references must return stable outcomes.
- Newly created questions should remain non-student-facing until later answer-option assembly and exam availability behavior are confirmed.

### 4. Integrity and visibility posture

- Question creation should define the assessment item without exposing correctness details more broadly than needed for controlled authoring.
- Question records must remain separate from student attempt data, submitted answers, scores, and pass/fail outcomes.
- Student-facing rendering should depend on later approved exam-taking behavior rather than being assumed automatically at question creation time.
- Company-facing access to exam outcomes remains governed by later privacy and results-visibility units and must not be implied by question authoring behavior.

### 5. Frontend and API alignment

- The protected question-creation flow belongs in a protected platform-management route area rather than the student learning area.
- The final API shape for question creation may be detailed later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most form state for question creation should remain local to the feature rather than promoted to global state unless reuse is justified later.

### 6. Relationship to later units

- U5-3 answer options management should attach structured answer options to the question records defined here when the question type requires them.
- U5-4 exam taking UI and U5-5 answer submission should consume only appropriately assembled and available question definitions.
- U5-6 score calculation should use the same question identity and scoring-ready metadata rather than redefining question structure.
- Later exam-management units may expand editing, media support, and authoring ergonomics without redefining the creation baseline.

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

## Outputs

- Baseline protected question-creation flow
- Question-authoring access and validation expectations
- Integration expectations for later answer-option, delivery, submission, and scoring units

## User flow

1. Authorized platform operator opens the protected question-authoring area for an existing exam.
2. Frontend presents the required question-creation form.
3. Operator provides question metadata and submits the question definition.
4. Backend validates the request and creates a structured question record linked to the target exam with a stable outcome.
5. The new question becomes available for later answer-option authoring, controlled exam assembly, and student delivery when allowed by later units.

## Acceptance criteria

- Question-creation behavior is documented clearly.
- Protected authoring access is defined and separated from student and company actions.
- Structured question-record expectations, validation outcomes, and audit-sensitive posture are documented.
- The unit is kept separate from answer-options, exam taking, scoring, and results logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Exam creation or editing workflows
- Answer-option authoring
- Student exam-taking flows
- Score calculation or pass/fail rules
- Publication moderation or review workflows beyond the baseline protected posture
