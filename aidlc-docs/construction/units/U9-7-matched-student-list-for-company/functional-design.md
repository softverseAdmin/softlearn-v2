# Functional design: U9-7-matched-student-list-for-company

## Purpose

Define the baseline company-facing matched-student-list flow so authorized company users can review deterministic student recommendations for a specific vacancy using approved aggregate match results and privacy-safe explanations.

## User story

As an authorized company user, I need a ranked matched-student list for my vacancy so I can review explainable candidate recommendations without accessing protected student data beyond approved visibility rules.

## Functional requirements

### 1. Matched-student-list scope

- This unit covers company-facing presentation of matched students for a vacancy only.
- The baseline should support:
  - loading one company-owned or company-authorized vacancy context
  - retrieving eligible student match results for that vacancy
  - ranking matched students using the approved aggregate score baseline
  - presenting explanation-ready strengths and gaps at list level
- Aggregate score calculation remains the upstream responsibility of U9-6.

### 2. Authorization and visibility behavior

- Only authorized company users should access matched students for their permitted vacancies.
- Visibility must respect consent-aware student data controls and the privacy-filter baseline.
- Protected student data not approved for company visibility must remain hidden even if it influenced the aggregate match score.
- The baseline should support suppression or masking of students or factor details when policy rules require it.

### 3. Ranked recommendation behavior

- The matched-student list should use the approved aggregate match result and ranking posture.
- The baseline should support list entries that include:
  - student identity fields approved for company visibility
  - overall match score or match level
  - concise explanation-ready strengths and gaps
  - vacancy context linking the list to the company-selected job
- Repeated evaluation of the same authorized company, vacancy, and match-result set should produce the same ranked list ordering unless approved tie-break rules change.

### 4. Explainability posture

- Company users should receive enough explanation to understand why a student appears in the matched list.
- Explanations should be factor-based and human-readable, such as skill alignment, language fit, location compatibility, or readiness strength.
- Explanations must not reveal protected raw student data beyond approved visibility rules.
- The matched list remains recommendation support and must not present recommendations as hiring decisions or eligibility guarantees.

### 5. Relationship to later units

- Later shortlist, outreach, application-review, and interview units may consume company-visible matched-student results as recommendation context.
- Those later units must not redefine the ranking model or bypass privacy controls established here.
- Student-facing matched-job views remain a separate unit with their own visibility posture.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- Company authorization baselines
- U6-3 company view student results
- U6-4 privacy filter for results
- U7-4 vacancy list
- U7-5 vacancy detail
- U9-1 skill matching
- U9-2 course completion matching
- U9-3 exam score matching
- U9-4 language level matching
- U9-5 location preference matching
- U9-6 match score calculation

## Outputs

- Baseline company-facing matched-student-list flow
- Privacy-safe explanation and ranking expectations
- Integration expectations for later shortlist and outreach units

## User flow

1. An authorized company user opens a company vacancy context.
2. Backend verifies authorization and policy eligibility for matched-student access.
3. The platform loads approved aggregate match results for the vacancy.
4. The platform applies company-visible filtering and privacy-safe explanation shaping.
5. The ranked matched-student list is returned with approved student fields, match level or score, and concise reasons.

## Acceptance criteria

- Company-facing matched-student-list behavior is documented clearly.
- Authorization, privacy, ranking, and explanation boundaries are defined.
- The unit consumes upstream aggregate match results rather than redefining scoring.
- Protected student data remains out of scope for unauthorized exposure.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Aggregate match-score calculation logic
- Shortlist, messaging, application, or interview workflows
- Student-facing matched-job presentation
- Automated hiring decisions
