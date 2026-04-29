# Functional design: U9-2-course-completion-matching

## Purpose

Define the baseline course-completion-matching flow so the platform can compare structured student learning-completion evidence against a vacancy context as part of the broader learning-readiness component of matching.

## User story

As the platform, I need deterministic course-completion matching so relevant finished learning content can improve match quality in an explainable way.

## Functional requirements

### 1. Course-completion-matching scope

- This unit covers comparison of student course-completion evidence to a vacancy context only.
- The baseline should support:
  - loading protected student learning summary and course-completion evidence
  - evaluating whether completed learning appears relevant to the vacancy context
  - producing a stable course-completion-match outcome with explanation-ready details
  - returning strengths, gaps, or absence-of-evidence states predictably
- Exam-score, language, location, and aggregate match scoring remain separate later units.

### 2. Allowed learning inputs

- Course-completion matching must use structured platform data only.
- The baseline should support inputs such as:
  - student course-completion outcomes
  - student learning-summary evidence
  - vacancy role or structured job context approved for matching
  - other explicitly approved structured learning evidence introduced later
- Hidden or company-disallowed student learning details must remain protected outside approved matching flows.

### 3. Deterministic comparison behavior

- Repeated evaluation of the same learning evidence and vacancy context should produce the same course-completion-match outcome.
- Strong relevant completion evidence should improve the outcome more than weak or unrelated completion evidence.
- Missing or low-relevance completion evidence should reduce the factor outcome predictably rather than fail silently.
- Validation failures such as missing completion records, conflicting learning summary state, unsupported comparison inputs, or ambiguous relevance mapping must return stable outcomes.

### 4. Explainability and privacy posture

- Course-completion matching should produce explainable outputs such as relevant completed learning, partial learning evidence, or missing relevant completion signals.
- The baseline should avoid exposing protected raw learning data beyond what later approved match explanations can present.
- Matching remains recommendation support only and must not become an automated hiring decision.
- Company-facing use of learning-derived match factors must still respect privacy and visibility rules.

### 5. Relationship to later units

- U9-6 match score calculation should consume this course-completion-match outcome as part of the learning progress and readiness component rather than recomputing alternate learning logic.
- U9-7 matched student list for company and U9-8 matched jobs for student should present explainable learning-fit summaries derived from this baseline where visibility rules allow.
- Later readiness-sensitive units may align with this factor, but they must not redefine the underlying completion evidence model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Inception AI matching strategy baseline
- U4-8 course completion tracking
- U6-1 student learning summary
- U7-5 vacancy detail

## Outputs

- Baseline deterministic course-completion-matching flow
- Explainable learning-evidence fit expectations
- Integration expectations for later aggregate scoring and matched-view units

## User flow

1. The platform receives a student and vacancy context eligible for matching.
2. Backend loads protected student learning summary and course-completion evidence plus vacancy context.
3. The platform evaluates relevance of completed learning deterministically.
4. A structured course-completion-match outcome and explanation-ready details are recorded or returned.
5. Later aggregate scoring and matched-view units consume the learning-fit outcome under the rule-based matching posture.

## Acceptance criteria

- Course-completion-matching behavior is documented clearly.
- Deterministic comparison and explainability boundaries are defined.
- Structured relevant-learning and missing-evidence expectations are documented.
- The unit is kept separate from other match factors and aggregate match scoring.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Exam, language, or location matching
- Aggregate match-score calculation
- Matched-list presentation
- Automated hiring decisions
- External AI services
