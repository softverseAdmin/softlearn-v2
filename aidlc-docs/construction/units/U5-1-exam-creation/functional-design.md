# Functional design: U5-1-exam-creation

## Purpose

Define the baseline protected exam-creation flow so authorized platform operators can create structured assessment containers that later question, answer-option, attempt, scoring, and result units can consume consistently.

## User story

As an authorized platform operator, I need exam creation so the platform can define structured exams for students without relying on ad hoc assessment records.

## Functional requirements

### 1. Exam-creation scope

- This unit covers creation of exam records only.
- The baseline should support:
  - opening a protected exam-creation flow
  - entering required exam information
  - validating the submitted exam definition
  - creating a structured **Exam** record with a stable outcome
- Question authoring, answer-option management, exam taking, answer submission, scoring, pass/fail logic, history, and retake policy remain separate later units.

### 2. Protected authoring access

- Exam creation must be treated as a protected platform-management action.
- Students and company users must not create exams through this baseline.
- The baseline should assume admin or similarly authorized internal content-management access, aligned with secure-by-default admin rules.
- Exam-configuration changes are integrity-sensitive actions and should remain auditable.

### 3. Exam data and validation

- Exam creation should produce a structured **Exam** record rather than an untyped content blob.
- The baseline should support core exam fields such as title, summary or instructions, duration or timing constraints, availability-ready metadata, and lifecycle status needed for later delivery.
- Validation failures such as missing required fields, malformed timing values, or duplicate exam identity conflicts must return stable outcomes.
- Newly created exams should support a controlled non-public or draft posture until later question assembly and publication rules are confirmed.

### 4. Integrity and visibility posture

- Exam creation should define the assessment container without exposing exam internals unnecessarily.
- Creation of an exam record must remain separate from student attempt data, submitted answers, scores, and pass/fail outcomes.
- Student-facing availability should depend on later approved exam-taking and visibility behavior rather than being assumed automatically at creation time.
- Company-facing access to exam outcomes remains governed by later privacy and results-visibility units and must not be implied by authoring behavior.

### 5. Frontend and API alignment

- The protected exam-creation flow belongs in a protected platform-management route area rather than the student learning area.
- The final API shape for exam creation may be detailed later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most form state for exam creation should remain local to the feature rather than promoted to global state unless reuse is justified later.

### 6. Relationship to later units

- U5-2 question creation should attach structured question records to an existing exam.
- U5-3 answer options management should build on the exam and question structures defined by later units.
- U5-4 exam taking UI and U5-5 answer submission should consume only appropriately available exam definitions.
- U5-6 score calculation and U5-7 pass fail logic should rely on the same exam container baseline rather than redefining exam identity.
- Later admin exam-management units may expand editing, moderation, and publication controls without redefining the creation baseline.

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

## Outputs

- Baseline protected exam-creation flow
- Exam-authoring access and validation expectations
- Integration expectations for later question, attempt, scoring, and results units

## User flow

1. Authorized platform operator enters the protected exam-creation area.
2. Frontend presents the required exam-creation form.
3. Operator provides exam metadata and submits the exam definition.
4. Backend validates the request and creates a structured exam record with a stable outcome.
5. The new exam becomes available for later question authoring, controlled publication, and student delivery when allowed by later units.

## Acceptance criteria

- Exam-creation behavior is documented clearly.
- Protected authoring access is defined and separated from student and company actions.
- Structured exam-record expectations, validation outcomes, and audit-sensitive posture are documented.
- The unit is kept separate from question authoring, exam taking, scoring, and results logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Question creation or answer-option authoring
- Student exam-taking flows
- Score calculation or pass/fail rules
- Exam editing or deletion workflows
- Publication moderation or review workflows beyond the baseline protected posture
