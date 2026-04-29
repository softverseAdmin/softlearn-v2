# Functional design: U9-1-skill-matching

## Purpose

Define the baseline skill-matching flow so the platform can compare structured student skills against structured vacancy skill requirements as the strongest explainable factor in later overall match scoring.

## User story

As the platform, I need deterministic skill matching so student-job fit can be evaluated using structured required and preferred skills instead of ad hoc judgment.

## Functional requirements

### 1. Skill-matching scope

- This unit covers skill-based comparison between a student and a vacancy only.
- The baseline should support:
  - loading structured student skill data
  - loading structured vacancy skill requirements
  - evaluating required and preferred skill fit deterministically
  - producing a stable skill-match outcome with explainable details
- Language, course-completion, exam-score, location, and aggregate match scoring remain separate later units.

### 2. Allowed skill inputs

- Skill matching must use structured platform data only.
- The baseline should support inputs such as:
  - student skills from the shared skill taxonomy
  - vacancy required skills
  - vacancy preferred skills
  - approved requirement-priority signals where defined later
- Free-text-only skill inference must not replace the shared skill taxonomy baseline.

### 3. Deterministic comparison behavior

- Required skill coverage should drive most of the skill-match outcome.
- Preferred skill coverage may improve the skill-match outcome without outweighing missing required skills.
- Repeated evaluation of the same student-skill and vacancy-skill set should produce the same skill-match result.
- Validation failures such as missing taxonomy references, conflicting skill records, unsupported comparison inputs, or ambiguous required-versus-preferred state must return stable outcomes.

### 4. Explainability posture

- Skill matching should produce explainable outputs such as matched required skills, missing required skills, and helpful preferred-skill coverage summaries.
- The baseline should avoid opaque or hidden skill-fit logic.
- Skill-matching output should remain suitable for later aggregate match scoring and human-readable explanations.
- Later implementation may refine partial-credit behavior, but the baseline should already assume explainable structured comparison.

### 5. Privacy and policy posture

- Skill matching may consume protected student skill data internally.
- Company-facing use of skill-match outputs must not bypass later privacy and visibility rules.
- Matching remains recommendation support only and must not become an automated hiring decision.
- Admin or support review of skill-match behavior, if needed later, must remain purposeful and auditable.

### 6. Relationship to later units

- U9-6 match score calculation should consume this skill-match outcome as the highest-weight factor rather than recomputing alternate skill logic.
- U9-7 matched student list for company and U9-8 matched jobs for student should present explainable skill-fit summaries derived from this baseline.
- Later candidate-review and application units may use skill-match explanations as context but must not redefine the skill-matching model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Inception AI matching strategy baseline
- U2-4 student profile skills
- U7-6 vacancy skill tags

## Outputs

- Baseline deterministic skill-matching flow
- Explainable skill-fit and missing-skill expectations
- Integration expectations for later aggregate scoring and matched-view units

## User flow

1. The platform receives a student and vacancy context eligible for matching.
2. Backend loads structured student skills and vacancy required and preferred skill requirements.
3. The platform evaluates required and preferred skill fit deterministically.
4. A structured skill-match outcome and explanation-ready details are recorded or returned.
5. Later aggregate scoring and matched-view units consume the skill-match outcome under the rule-based matching posture.

## Acceptance criteria

- Skill-matching behavior is documented clearly.
- Deterministic comparison and explainability boundaries are defined.
- Structured matched-skill and missing-skill expectations are documented.
- The unit is kept separate from other match factors and aggregate match scoring.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Language, exam, or location matching
- Aggregate match-score calculation
- Matched-list presentation
- Automated hiring decisions
- External AI services
