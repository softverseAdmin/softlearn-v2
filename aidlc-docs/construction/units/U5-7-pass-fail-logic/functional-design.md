# Functional design: U5-7-pass-fail-logic

## Purpose

Define the baseline pass/fail evaluation flow so the platform can classify scored exam attempts into stable assessment outcomes using explicit rules rather than ad hoc interpretation.

## User story

As the platform, I need explicit pass/fail logic so scored exam attempts can produce consistent outcome states that later result, retake, and readiness features can rely on.

## Functional requirements

### 1. Pass/fail scope

- This unit covers classification of scored exam attempts into pass/fail outcome states only.
- The baseline should support:
  - receiving a scored attempt that is eligible for outcome classification
  - applying an explicit rule or threshold set tied to the relevant exam definition
  - producing a stable pass/fail outcome for the attempt
  - attaching the resulting outcome state to the evaluated attempt in a traceable way
- Score calculation, history presentation, result visibility, and retake policy remain separate later units.

### 2. Protected evaluation access

- Pass/fail classification is a protected backend decision step rather than a public or company-facing feature.
- Students may receive the classified outcome only through later approved result flows; they should not control the decision logic itself.
- Company users must not access or trigger pass/fail classification outside explicitly allowed future contexts.
- Admin access to threshold changes or reclassification, if introduced later, must remain purposeful, logged, and policy-bound.

### 3. Outcome data and validation

- Pass/fail logic should operate on structured score outcomes tied to a defined **ExamAttempt** and **Exam** context.
- The baseline should support explicit classification inputs such as score thresholds, minimum requirements, or other deterministic exam-level outcome rules approved later.
- Validation failures such as missing score data, ambiguous threshold configuration, unsupported outcome rules, or incomplete finalized attempt state must return stable outcomes rather than creating conflicting pass/fail records.
- Pass/fail outcomes should be structured and traceable enough for later result presentation, history, retake, readiness, and audit use.

### 4. Determinism and policy posture

- Repeated classification of the same eligible scored attempt against the same approved rules should produce the same pass/fail outcome.
- Pass/fail logic must remain separate from raw score calculation, result visibility, and retake eligibility policy.
- The baseline should support transparent ownership of which scored attempt was classified and which rule set was used.
- Later implementation may refine richer outcome bands or review paths, but the baseline should already assume deterministic and auditable pass/fail behavior.

### 5. API and architecture alignment

- The final API or service boundaries for pass/fail logic may be detailed later, but they must remain consistent with the existing versioned REST baseline, standard validation envelopes, and backend audit expectations.
- Pass/fail classification should reuse the structured exam domain and scored-attempt model rather than creating a parallel result-policy model.
- Outcome states should remain compatible with later student-result summaries and rule-based readiness features.

### 6. Relationship to later units

- U5-8 exam history should present attempt summaries using the same classified outcome records.
- U5-9 exam retake policy should use pass/fail outcomes and attempt state when determining whether another attempt is allowed.
- Later student exam-result summary and company-visibility units may use pass/fail outcomes only under the appropriate privacy and visibility rules.
- Later readiness and matching units may use pass/fail outcomes as explainable evidence alongside scores and learning progress.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U5-1 exam creation
- U5-5 answer submission
- U5-6 score calculation

## Outputs

- Baseline deterministic pass/fail evaluation flow
- Outcome-classification, validation, and traceability expectations
- Integration expectations for later history, retake, readiness, and visibility-sensitive units

## User flow

1. The platform receives a scored exam attempt that is eligible for outcome classification.
2. Backend evaluation loads the related exam-level pass/fail rule inputs.
3. The platform validates that the scored attempt is classifiable and applies the explicit rule set.
4. A structured pass/fail outcome is recorded or returned for the attempt with a stable result.
5. Later history, retake, readiness, and visibility-sensitive units consume the classified outcome under their own rules.

## Acceptance criteria

- Pass/fail behavior is documented clearly.
- Deterministic classification and protected processing boundaries are defined.
- Structured validation, traceability, and explainability expectations are documented.
- The unit is kept separate from raw scoring, result visibility, and retake logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Student-facing result presentation
- Raw score calculation internals
- Exam history presentation
- Retake-governance decisions
- Company-facing result exposure
