# Functional design: U9-5-location-preference-matching

## Purpose

Define the baseline location-preference-matching flow so the platform can compare structured student work-location preferences against structured vacancy location and work-style settings as a deterministic factor in later overall match scoring.

## User story

As the platform, I need deterministic location preference matching so student-job fit can be evaluated using explicit location and work-style compatibility instead of ad hoc judgment.

## Functional requirements

### 1. Location-preference-matching scope

- This unit covers location and work-style comparison between a student and a vacancy only.
- The baseline should support:
  - loading structured student desired work-location and flexibility signals
  - loading structured vacancy location and work-style settings
  - evaluating location compatibility deterministically
  - producing a stable location-match outcome with explanation-ready details
- Skill, exam, language, and aggregate match scoring remain separate later units.

### 2. Allowed location inputs

- Location-preference matching must use structured platform data only.
- The baseline should support inputs such as:
  - student desired work location
  - student flexibility or availability signals where relevant
  - vacancy location settings
  - vacancy remote, hybrid, onsite, or relocation posture
- Free-text-only location inference must not replace the structured location-setting model.

### 3. Deterministic comparison behavior

- Exact or clearly acceptable preference matches should improve the factor outcome more than weak or incompatible matches.
- Remote or hybrid compatibility may improve an otherwise imperfect location fit when the structured inputs allow it.
- Repeated evaluation of the same student location inputs and vacancy location settings should produce the same location-match result.
- Validation failures such as malformed location inputs, unsupported work-style combinations, missing structured settings, or ambiguous flexibility posture must return stable outcomes.

### 4. Explainability and privacy posture

- Location-preference matching should produce explainable outputs such as direct match, flexible compatibility, or hard mismatch.
- The baseline should avoid opaque or hidden compatibility logic.
- Location-match output should remain suitable for later aggregate match scoring and human-readable explanations.
- Company-facing use of location-derived match factors must still respect privacy and visibility rules where student preference data is protected.

### 5. Relationship to later units

- U9-6 match score calculation should consume this location-match outcome as the dedicated location factor rather than recomputing alternate compatibility logic.
- U9-7 matched student list for company and U9-8 matched jobs for student should present explainable location-fit summaries derived from this baseline.
- Later candidate-review and application units may use location-match explanations as context but must not redefine the location-matching model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Inception AI matching strategy baseline
- U2-3 student profile basic
- U2-9 student availability management
- U7-8 vacancy location settings

## Outputs

- Baseline deterministic location-preference-matching flow
- Explainable location-fit expectations
- Integration expectations for later aggregate scoring and matched-view units

## User flow

1. The platform receives a student and vacancy context eligible for matching.
2. Backend loads structured student location preference data and vacancy location settings.
3. The platform evaluates compatibility deterministically against work-style and location constraints.
4. A structured location-match outcome and explanation-ready details are recorded or returned.
5. Later aggregate scoring and matched-view units consume the location-fit outcome under the rule-based matching posture.

## Acceptance criteria

- Location-preference-matching behavior is documented clearly.
- Deterministic comparison and explainability boundaries are defined.
- Structured location-compatibility expectations are documented.
- The unit is kept separate from other match factors and aggregate match scoring.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Skill, exam, or language matching
- Aggregate match-score calculation
- Matched-list presentation
- Automated hiring decisions
- External AI services
