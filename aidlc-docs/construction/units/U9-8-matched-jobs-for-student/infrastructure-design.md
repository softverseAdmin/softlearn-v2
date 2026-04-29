# Infrastructure design: U9-8-matched-jobs-for-student

## Infrastructure impact

This unit does not provision infrastructure, but it defines a protected student-facing retrieval path for presenting ranked matched jobs from aggregate match results.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for student-side matched-job presentation refinements

## External services

- None required for the baseline matched-jobs flow
- External AI recommendation and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected student-facing access to visible matched jobs.
- Later AWS-compatible deployment should preserve the same vacancy-visibility, explanation, and recommendation posture for student match views.
- Matched-jobs presentation must remain compatible with upstream aggregate scoring and downstream application workflows.

## Database impact

- The baseline relies on visible access to **Vacancy**, student-owned context, **MatchResult**, and related **MatchFactor** explanation outputs or equivalent storage.
- Vacancy-visibility filtering must be applied before student-facing retrieval completes.
- The unit should not create bookmark, application, or interview records directly.
