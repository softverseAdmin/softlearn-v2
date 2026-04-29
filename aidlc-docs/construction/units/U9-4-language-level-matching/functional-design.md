# Functional design: U9-4-language-level-matching

## Purpose

Define the baseline language-level-matching flow so the platform can compare structured student language levels against structured vacancy language requirements as a deterministic factor in later overall match scoring.

## User story

As the platform, I need deterministic language matching so student-job fit can be evaluated using explicit language requirements and explainable threshold comparisons.

## Functional requirements

### 1. Language-level-matching scope

- This unit covers language-level comparison between a student and a vacancy only.
- The baseline should support:
  - loading structured student language levels
  - loading structured vacancy language requirements
  - evaluating minimum language-fit deterministically
  - producing a stable language-match outcome with explanation-ready details
- Skill, exam, location, and aggregate match scoring remain separate later units.

### 2. Allowed language inputs

- Language-level matching must use structured platform data only.
- The baseline should support inputs such as:
  - student Japanese and English language levels where available
  - other approved structured language records later
  - vacancy language requirements and minimum levels
  - required and preferred language expectations where defined
- Free-text-only language inference must not replace the shared language-level model.

### 3. Deterministic comparison behavior

- Meeting or exceeding a required language level should improve the outcome more than falling below it.
- Slightly below a requirement may produce a partial factor result if later rules allow, but clearly below should reduce the outcome predictably.
- Repeated evaluation of the same student language set and vacancy requirement set should produce the same language-match result.
- Validation failures such as missing language references, malformed level comparisons, unsupported combinations, or ambiguous required-versus-preferred state must return stable outcomes.

### 4. Explainability and privacy posture

- Language-level matching should produce explainable outputs such as meets requirement, slightly below, or clearly below requirement.
- The baseline should avoid opaque or hidden threshold logic.
- Language-match output should remain suitable for later aggregate match scoring and human-readable explanations.
- Company-facing use of language-derived match factors must still respect privacy and visibility rules where student language data is protected.

### 5. Relationship to later units

- U9-6 match score calculation should consume this language-match outcome as the dedicated language factor rather than recomputing alternate threshold logic.
- U9-7 matched student list for company and U9-8 matched jobs for student should present explainable language-fit summaries derived from this baseline.
- Later candidate-review and application units may use language-match explanations as context but must not redefine the language-matching model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Inception AI matching strategy baseline
- U2-7 student profile language level
- U7-7 vacancy language requirements

## Outputs

- Baseline deterministic language-level-matching flow
- Explainable language-fit expectations
- Integration expectations for later aggregate scoring and matched-view units

## User flow

1. The platform receives a student and vacancy context eligible for matching.
2. Backend loads structured student language data and vacancy language requirements.
3. The platform evaluates language-fit deterministically against the required levels.
4. A structured language-match outcome and explanation-ready details are recorded or returned.
5. Later aggregate scoring and matched-view units consume the language-fit outcome under the rule-based matching posture.

## Acceptance criteria

- Language-level-matching behavior is documented clearly.
- Deterministic comparison and explainability boundaries are defined.
- Structured language-threshold expectations are documented.
- The unit is kept separate from other match factors and aggregate match scoring.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Skill, exam, or location matching
- Aggregate match-score calculation
- Matched-list presentation
- Automated hiring decisions
- External AI services
