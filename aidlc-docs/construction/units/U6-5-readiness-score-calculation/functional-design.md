# Functional design: U6-5-readiness-score-calculation

## Purpose

Define the baseline readiness-score calculation flow so the platform can turn protected learning and exam evidence into a deterministic, explainable readiness measure that later student-guidance and matching units can consume consistently.

## User story

As a student and as the platform, I need a clear readiness score so learning and exam evidence can be summarized into an understandable signal without relying on opaque AI behavior.

## Functional requirements

### 1. Readiness-score scope

- This unit covers calculation of a structured readiness measure only.
- The baseline should support:
  - receiving eligible learning-summary and exam-results-summary evidence for a student
  - applying deterministic rule-based scoring to that evidence
  - producing a stable **ReadinessScore** outcome with explainable factors
  - attaching the resulting readiness measure to the student context in a traceable way
- Company-facing visibility rules, full vacancy match scoring, and richer recommendation UX remain separate later units.

### 2. Allowed readiness inputs

- Readiness scoring must use structured platform data only.
- The baseline should support readiness inputs such as:
  - relevant course completion
  - relevant lesson progress
  - exam attempts and results
  - other explicitly approved structured preparation signals when introduced later
- Readiness scoring must not use opaque AI, ML, LLM, embeddings, or external AI services in v1.

### 3. Deterministic scoring behavior

- Readiness score calculation should be rule-based and explainable.
- Repeated evaluation of the same eligible evidence set should produce the same readiness outcome.
- Validation failures such as missing required evidence, conflicting source summaries, unsupported scoring inputs, or ambiguous rule configuration must return stable outcomes rather than creating conflicting readiness records.
- The baseline should support explainable factor outputs so later product surfaces can describe why readiness is high, medium, or low.

### 4. Privacy and visibility posture

- Readiness scoring may consume protected student learning and exam evidence internally.
- Internal readiness calculation must not bypass privacy or consent rules when any derived readiness output is later exposed to company users.
- Company-facing use of readiness signals, if allowed later, must respect the same privacy-filter and company-view baselines rather than treating readiness as automatically public.
- Student-facing readiness presentation may be expanded later, but the baseline should already assume protected, auditable use of source evidence.

### 5. Relationship to matching strategy

- Readiness score should align with the rule-based matching strategy rather than inventing a separate opaque scoring model.
- The baseline should support readiness as explainable evidence that can contribute to later matching, especially the learning progress and exam readiness component of the overall match strategy.
- Readiness score calculation must remain recommendation support only and must not become an automated hiring decision.
- Later vacancy-matching units may combine readiness with skills, language, location, and profile completeness factors under the approved weighted strategy.

### 6. API and architecture alignment

- The final API or service boundaries for readiness score calculation may be detailed later, but they must remain consistent with the existing versioned REST baseline, standard validation envelopes, and audit expectations.
- Readiness scoring should reuse protected learning-summary and exam-results-summary evidence rather than creating parallel hidden evidence models.
- The resulting readiness measure should remain compatible with later student guidance, matching, and policy-sensitive visibility workflows.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Inception AI matching strategy baseline
- U1-4 base API structure
- U4-8 course completion tracking
- U5-8 exam history
- U6-1 student learning summary
- U6-2 student exam results summary
- U6-4 privacy filter for results

## Outputs

- Baseline deterministic readiness-score calculation flow
- Explainability, validation, and privacy expectations for readiness evidence
- Integration expectations for later matching, guidance, and visibility-sensitive units

## User flow

1. The platform receives eligible student learning and exam summary evidence.
2. Backend evaluation validates that the evidence set is usable for readiness scoring.
3. The platform applies deterministic rule-based scoring and records or returns a structured readiness outcome with explainable factors.
4. Student-facing or later downstream units consume the readiness measure under the appropriate privacy and visibility rules.
5. Later matching units may reuse the same readiness evidence as one explainable factor in broader vacancy scoring.

## Acceptance criteria

- Readiness-score calculation behavior is documented clearly.
- Deterministic, explainable, and privacy-aware scoring boundaries are defined.
- Structured validation, traceability, and downstream-use expectations are documented.
- The unit is kept separate from company-facing visibility rules and full vacancy matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Full vacancy match scoring
- Company-facing readiness exposure rules
- ML, LLM, embeddings, or external AI services
- Automated hiring decisions
- Advanced analytics or dashboards
