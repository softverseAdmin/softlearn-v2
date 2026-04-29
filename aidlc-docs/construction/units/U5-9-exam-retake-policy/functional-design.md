# Functional design: U5-9-exam-retake-policy

## Purpose

Define the baseline exam-retake policy flow so the platform can determine whether a student may re-enter an exam based on prior attempt state, scored outcomes, and explicit exam-level rules.

## User story

As a student and as the platform, I need explicit retake policy so future exam access is governed consistently instead of by ad hoc decisions after each attempt.

## Functional requirements

### 1. Retake-policy scope

- This unit covers the rules and decision flow for allowing or denying additional exam attempts only.
- The baseline should support:
  - evaluating whether a student is eligible to retake a given exam
  - using prior attempt history and relevant outcome state as decision inputs
  - producing a stable eligibility or ineligibility outcome
  - making the eligibility result available to later exam-access flows
- Exam-history presentation, score calculation, pass/fail logic, and company-facing result visibility remain separate later units.

### 2. Protected policy access

- Retake evaluation is a protected platform decision step rather than a public or company-controlled feature.
- Students may receive the resulting eligibility state through later approved student-facing flows, but they should not control the rule logic itself.
- Company users must not access or influence retake eligibility decisions.
- Admin exceptions or policy overrides, if introduced later, must remain purposeful, logged, and policy-bound.

### 3. Eligibility data and validation

- Retake policy should operate on structured **ExamAttempt**, score, and pass/fail outcome data tied to the student and exam context.
- The baseline should support explicit exam-level rule inputs such as maximum attempts, cooldown windows, required prior states, or other deterministic eligibility constraints approved later.
- Validation failures such as missing attempt history, ambiguous rule configuration, unsupported eligibility inputs, or conflicting attempt states must return stable outcomes rather than creating contradictory retake decisions.
- Eligibility outcomes should be structured and traceable enough for later exam-access, history, readiness, and audit use.

### 4. Determinism and fairness posture

- Repeated eligibility evaluation of the same student, exam, and rule set should produce the same retake decision.
- Retake policy must remain separate from score calculation, pass/fail classification, and company-facing result visibility.
- The baseline should support transparent ownership of which attempt history and rule set were used to decide eligibility.
- Later implementation may refine cooldown timing, exception handling, or richer outcome states, but the baseline should already assume deterministic and auditable retake behavior.

### 5. API and route alignment

- The final API or service boundaries for retake policy may be detailed later, but they must remain consistent with the existing versioned REST baseline, standard validation envelopes, and backend audit expectations.
- Retake decisions should remain compatible with protected student exam-access routes and later exam-history views.
- Eligibility outcomes should not silently bypass authentication, authorization, or privacy rules when used by later student-facing flows.

### 6. Relationship to later units

- Later student exam-access flows should use the same eligibility result when deciding whether to show or block a new attempt path.
- Later student exam-results summary units may use retake eligibility as contextual information but must not redefine the rule set.
- Later readiness and matching units may consume exam outcomes, but they must not infer or expose retake policy details beyond approved visibility boundaries.
- Later company-facing results units must not access retake-policy reasoning unless explicitly allowed by future privacy rules.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U5-5 answer submission
- U5-6 score calculation
- U5-7 pass fail logic
- U5-8 exam history

## Outputs

- Baseline deterministic retake-policy flow
- Eligibility, validation, and traceability expectations
- Integration expectations for later exam-access, results-summary, and visibility-sensitive units

## User flow

1. The platform evaluates whether a student can attempt a particular exam again.
2. Backend policy logic loads the student’s relevant prior attempts, score outcomes, pass/fail state, and exam-level retake rules.
3. The platform validates that the inputs are sufficient and applies the explicit retake rule set.
4. A structured eligibility or ineligibility outcome is recorded or returned with a stable result.
5. Later student exam-access and visibility-sensitive units consume the retake outcome under their own rules.

## Acceptance criteria

- Retake-policy behavior is documented clearly.
- Deterministic eligibility and protected processing boundaries are defined.
- Structured validation, traceability, and fairness expectations are documented.
- The unit is kept separate from score calculation, history presentation, and company-facing visibility logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Student-facing history presentation
- Raw score calculation internals
- Pass/fail threshold definition
- Company-facing result exposure
- Admin override implementation details beyond the baseline policy posture
