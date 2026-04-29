# Functional design: U9-6-match-score-calculation

## Purpose

Define the baseline match-score-calculation flow so the platform can combine deterministic factor outcomes into a stable overall match result and match level for one student-vacancy comparison.

## User story

As the platform, I need a deterministic aggregate match score so students and companies can receive explainable recommendation support instead of opaque ranking behavior.

## Functional requirements

### 1. Match-score-calculation scope

- This unit covers aggregation of match factors into one overall match result only.
- The baseline should support:
  - receiving eligible factor outcomes for one student-vacancy comparison
  - applying the approved weighted rule-based scoring model
  - producing a stable overall match score and match level
  - returning explanation-ready factor summaries alongside the aggregate result
- Matched-list presentation, applications, and recommendation UX remain separate later units.

### 2. Allowed aggregate inputs

- Match score calculation must use structured platform data and deterministic factor outputs only.
- The baseline should aggregate:
  - skill-match outcome
  - language-level-match outcome
  - location-preference-match outcome
  - learning and exam readiness evidence from course-completion and exam-score matching
  - profile-completeness signals drawn from existing student profile completion indicators
- The baseline must not use ML models, LLMs, embeddings, OpenAI APIs, or external AI services.

### 3. Weighted scoring behavior

- The aggregate score must use the approved 0 to 100 weighted rule-based model.
- The baseline should align with the inception weighting direction:
  - skill match: 40
  - language match: 20
  - location match: 15
  - learning progress and exam readiness: 15
  - profile completeness: 10
- Repeated evaluation of the same factor set should produce the same overall score and match level.
- Validation failures such as missing required factor outputs, conflicting factor states, unsupported weight configuration, or ambiguous profile-completeness inputs must return stable outcomes.

### 4. Match classification and explanation posture

- The baseline should support stable match levels such as Strong Match, Good Match, Possible Match, and Low Match using the approved score bands.
- Aggregate match results must preserve human-readable explanations derived from the contributing factor outcomes.
- Explanation behavior should show both strengths and gaps rather than only a raw numeric score.
- Matching remains recommendation support only and must not become an automated hiring decision.

### 5. Ranking and privacy posture

- Aggregate match scoring should support later ranking behavior such as highest score first and approved tie-break rules.
- Company-facing use of match results must still respect privacy, consent, and company-visibility rules.
- Student-facing use of match results should remain explainable and not reveal hidden company or student data improperly.
- The baseline should preserve auditable linkage between factor outputs and the final aggregate result.

### 6. Relationship to later units

- U9-7 matched student list for company should consume the aggregate match result and approved explanations without redefining the weighted scoring model.
- U9-8 matched jobs for student should consume the same aggregate match result and ranking posture without redefining factor weights.
- Later application and shortlist units may use match results as recommendation context but must not treat them as automated decisions.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Inception AI matching strategy baseline
- U2-3 student profile basic
- U2-4 student profile skills
- U2-7 student profile language level
- U2-8 student resume management
- U2-9 student availability management
- U6-5 readiness score calculation
- U9-1 skill matching
- U9-2 course completion matching
- U9-3 exam score matching
- U9-4 language level matching
- U9-5 location preference matching

## Outputs

- Baseline deterministic aggregate match-score-calculation flow
- Match-level, explanation, and ranking expectations
- Integration expectations for later matched-list and recommendation-adjacent units

## User flow

1. The platform receives eligible factor outcomes for one student and one vacancy.
2. Backend validates the factor set and profile-completeness inputs needed for aggregation.
3. The platform applies the deterministic weighted scoring model and derives an overall match score.
4. The platform assigns a match level and retains explanation-ready factor summaries.
5. Later matched-list units consume the aggregate score, match level, and explanations under the rule-based recommendation posture.

## Acceptance criteria

- Match-score-calculation behavior is documented clearly.
- Deterministic weighting, classification, and explainability boundaries are defined.
- Structured factor-aggregation and profile-completeness expectations are documented.
- The unit is kept separate from matched-list presentation and application logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Matched-list presentation
- Application or shortlist workflows
- ML, LLMs, embeddings, or external AI services
- Automated hiring decisions
- Dashboard or analytics behavior
