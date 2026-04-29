# Functional design: U5-6-score-calculation

## Purpose

Define the baseline score-calculation flow so the platform can evaluate submitted exam attempts into structured score outcomes using the existing exam, question, and answer-option definitions consistently.

## User story

As the platform, I need deterministic score calculation so submitted exam attempts can be evaluated in a stable and explainable way before later pass/fail and history features consume the results.

## Functional requirements

### 1. Score-calculation scope

- This unit covers score evaluation of submitted exam attempts only.
- The baseline should support:
  - receiving a submitted attempt that is eligible for evaluation
  - comparing submitted responses against the relevant exam-definition and correctness-ready metadata
  - calculating a structured score outcome with a stable result
  - attaching the resulting score to the evaluated attempt in a traceable way
- Pass/fail logic, history presentation, result visibility, and retake policy remain separate later units.

### 2. Protected evaluation access

- Score calculation is a protected backend evaluation action rather than a public or company-facing feature.
- Students may receive the evaluated outcome only through later approved result flows; they should not control the scoring logic itself.
- Company users must not access or trigger scoring outside explicitly allowed future contexts.
- Admin access to score recalculation or review, if introduced later, must remain purposeful, logged, and policy-bound.

### 3. Score data and validation

- Score calculation should operate on structured **ExamAttempt**, **ExamAnswer**, **Question**, and **AnswerOption** data tied to a defined **Exam**.
- The baseline should support deterministic calculation using the available correctness-ready metadata and scoring-ready question definitions.
- Validation failures such as missing attempt data, inconsistent question references, unsupported scoring inputs, or incomplete finalized attempt state must return stable outcomes rather than creating conflicting score records.
- Score outcomes should be structured and traceable enough for later pass/fail, history, readiness, and audit use.

### 4. Reliability and explainability posture

- Repeated evaluation of the same eligible attempt data should produce the same score outcome unless an approved revision path is defined later.
- Score calculation must remain separate from pass/fail threshold policy, result visibility, and retake eligibility.
- The baseline should support transparent ownership of which submitted attempt was scored and which exam definition was used.
- Later implementation may refine partial-credit or manual-review cases, but the baseline should already assume deterministic and auditable scoring behavior.

### 5. API and architecture alignment

- The final API or service boundaries for score calculation may be detailed later, but they must remain consistent with the existing versioned REST baseline, standard validation envelopes, and backend audit expectations.
- Score calculation should reuse the structured exam domain rather than creating a parallel evaluation model.
- Score outcomes should remain compatible with later student-result summaries and rule-based readiness features.

### 6. Relationship to later units

- U5-7 pass fail logic should consume the score outcome from this unit rather than recalculating raw answer correctness independently.
- U5-8 exam history should present scored attempts using the same evaluated attempt records.
- U5-9 exam retake policy should use scored-attempt outcomes and attempt state where needed without redefining scoring rules.
- Later readiness and matching units may use exam scores as explainable evidence under the appropriate privacy and visibility rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U5-1 exam creation
- U5-2 question creation
- U5-3 answer options management
- U5-5 answer submission

## Outputs

- Baseline deterministic score-calculation flow
- Evaluation, validation, and traceability expectations
- Integration expectations for later pass/fail, history, retake, and readiness-sensitive units

## User flow

1. The platform receives an eligible submitted exam attempt.
2. Backend evaluation loads the related exam, question, answer-option, and submitted-answer data.
3. The platform validates that the attempt is scorable and compares the submitted answers against the defined scoring inputs.
4. A structured score outcome is recorded or returned for the attempt with a stable result.
5. Later pass/fail, history, readiness, and visibility-sensitive units consume the score outcome under their own rules.

## Acceptance criteria

- Score-calculation behavior is documented clearly.
- Deterministic evaluation and protected processing boundaries are defined.
- Structured validation, traceability, and explainability expectations are documented.
- The unit is kept separate from pass/fail, result visibility, and retake logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Student-facing score presentation
- Pass/fail threshold policy
- Exam history presentation
- Retake-governance decisions
- Company-facing result exposure
