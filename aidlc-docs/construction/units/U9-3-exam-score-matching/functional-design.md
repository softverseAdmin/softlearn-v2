# Functional design: U9-3-exam-score-matching

## Purpose

Define the baseline exam-score-matching flow so the platform can compare structured student exam outcomes against vacancy context as part of the broader learning-readiness component of matching.

## User story

As the platform, I need deterministic exam-score matching so relevant assessment results can improve match quality in an explainable way.

## Functional requirements

### 1. Exam-score-matching scope

- This unit covers comparison of student exam evidence to a vacancy context only.
- The baseline should support:
  - loading protected student exam-results summary and exam evidence
  - evaluating whether exam outcomes appear relevant to the vacancy context
  - producing a stable exam-score-match outcome with explanation-ready details
  - returning strengths, gaps, or absence-of-evidence states predictably
- Language, location, and aggregate match scoring remain separate later units.

### 2. Allowed exam inputs

- Exam-score matching must use structured platform data only.
- The baseline should support inputs such as:
  - student exam attempt outcomes
  - student score and pass/fail state
  - student exam-results summary evidence
  - vacancy role or structured job context approved for matching
- Hidden or company-disallowed student exam details must remain protected outside approved matching flows.

### 3. Deterministic comparison behavior

- Repeated evaluation of the same exam evidence and vacancy context should produce the same exam-score-match outcome.
- Strong relevant exam outcomes should improve the outcome more than weak or unrelated exam evidence.
- Missing or low-relevance exam evidence should reduce the factor outcome predictably rather than fail silently.
- Validation failures such as missing exam records, conflicting exam summary state, unsupported comparison inputs, or ambiguous relevance mapping must return stable outcomes.

### 4. Explainability and privacy posture

- Exam-score matching should produce explainable outputs such as relevant exam success, partial exam evidence, or missing relevant exam signals.
- The baseline should avoid exposing protected raw exam history beyond what later approved match explanations can present.
- Matching remains recommendation support only and must not become an automated hiring decision.
- Company-facing use of exam-derived match factors must still respect privacy and visibility rules.

### 5. Relationship to later units

- U9-6 match score calculation should consume this exam-score-match outcome as part of the learning progress and readiness component rather than recomputing alternate exam logic.
- U9-7 matched student list for company and U9-8 matched jobs for student should present explainable exam-fit summaries derived from this baseline where visibility rules allow.
- Later readiness-sensitive units may align with this factor, but they must not redefine the underlying exam evidence model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Inception AI matching strategy baseline
- U5-8 exam history
- U6-2 student exam results summary
- U7-5 vacancy detail

## Outputs

- Baseline deterministic exam-score-matching flow
- Explainable exam-evidence fit expectations
- Integration expectations for later aggregate scoring and matched-view units

## User flow

1. The platform receives a student and vacancy context eligible for matching.
2. Backend loads protected student exam summary and exam evidence plus vacancy context.
3. The platform evaluates relevance of exam outcomes deterministically.
4. A structured exam-score-match outcome and explanation-ready details are recorded or returned.
5. Later aggregate scoring and matched-view units consume the exam-fit outcome under the rule-based matching posture.

## Acceptance criteria

- Exam-score-matching behavior is documented clearly.
- Deterministic comparison and explainability boundaries are defined.
- Structured relevant-exam and missing-evidence expectations are documented.
- The unit is kept separate from other match factors and aggregate match scoring.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Language or location matching
- Aggregate match-score calculation
- Matched-list presentation
- Automated hiring decisions
- External AI services
