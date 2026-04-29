# Functional design: U9-8-matched-jobs-for-student

## Purpose

Define the baseline student-facing matched-jobs flow so a student can review deterministic job recommendations based on approved aggregate match results and clear factor-based explanations.

## User story

As a student, I need a ranked matched-jobs view so I can understand which vacancies fit my profile and learning progress without relying only on manual job search.

## Functional requirements

### 1. Matched-jobs scope

- This unit covers student-facing presentation of matched jobs only.
- The baseline should support:
  - loading vacancies eligible for student visibility
  - retrieving approved aggregate match results for the current student
  - ranking matched jobs using the approved aggregate score baseline
  - presenting explanation-ready strengths and gaps at list level
- Aggregate score calculation remains the upstream responsibility of U9-6.

### 2. Vacancy visibility behavior

- Only vacancies visible to the student under approved publication and access rules should appear in matched jobs.
- Hidden, withdrawn, unauthorized, or otherwise unavailable vacancies must not appear in the matched-jobs list.
- The baseline should keep matched jobs separate from general search results, bookmarks, and submitted applications even if a vacancy can appear in multiple contexts.
- Student-facing explanations should avoid exposing hidden company-internal evaluation data.

### 3. Ranked recommendation behavior

- The matched-jobs list should use the approved aggregate match result and ranking posture.
- The baseline should support list entries that include:
  - visible vacancy identity fields
  - overall match score or match level
  - concise explanation-ready strengths and gaps
  - direct linkage to the vacancy detail experience
- Repeated evaluation of the same student and visible vacancy set should produce the same ranked list ordering unless approved tie-break rules change.

### 4. Explainability posture

- Students should receive enough explanation to understand why a vacancy appears in the matched-jobs list.
- Explanations should be factor-based and human-readable, such as skill alignment, language fit, location compatibility, or readiness strength.
- Explanations should help students act, for example by showing where improvement might increase match quality.
- The matched-jobs list remains recommendation support and must not represent guaranteed employment outcomes.

### 5. Relationship to nearby units

- U8 job-search units remain responsible for general browsing and filters.
- U8-7 bookmark jobs remains responsible for explicit student save behavior and must not redefine matched-job ranking.
- Later application and interview units may consume matched jobs as recommendation context but must not redefine the aggregate scoring model.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U7-4 vacancy list
- U7-5 vacancy detail
- U8-1 job list page
- U8-2 job search bar
- U8-3 skill filter
- U8-4 language filter
- U8-5 location filter
- U8-6 salary filter
- U8-7 bookmark jobs
- U9-1 skill matching
- U9-2 course completion matching
- U9-3 exam score matching
- U9-4 language level matching
- U9-5 location preference matching
- U9-6 match score calculation

## Outputs

- Baseline student-facing matched-jobs flow
- Ranking and explanation expectations for student recommendations
- Integration expectations for later application and recommendation-adjacent units

## User flow

1. A student opens the matched-jobs area.
2. Backend verifies student identity and loads visible vacancies eligible for recommendation.
3. The platform loads approved aggregate match results for the student across visible jobs.
4. The platform ranks matched jobs and shapes student-facing explanations.
5. The student receives a matched-jobs list with visible vacancy fields, match level or score, and concise reasons.

## Acceptance criteria

- Student-facing matched-jobs behavior is documented clearly.
- Vacancy-visibility, ranking, and explanation boundaries are defined.
- The unit consumes upstream aggregate match results rather than redefining scoring.
- The unit stays separate from search, bookmarks, and application workflows.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Aggregate match-score calculation logic
- Search-filter logic and bookmark persistence
- Application or interview workflows
- Automated hiring outcomes
