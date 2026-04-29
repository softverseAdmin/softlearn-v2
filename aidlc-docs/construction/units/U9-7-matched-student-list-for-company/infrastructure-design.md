# Infrastructure design: U9-7-matched-student-list-for-company

## Infrastructure impact

This unit does not provision infrastructure, but it defines a protected company-facing retrieval path for presenting ranked matched students from aggregate match results.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for company-side match-list presentation refinements

## External services

- None required for the baseline matched-student-list flow
- External AI recommendation and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected recruiter-facing access to company-visible matched students.
- Later AWS-compatible deployment should preserve the same authorization, privacy, and explanation posture for company match views.
- Matched-student presentation must remain compatible with upstream aggregate scoring and downstream shortlist workflows.

## Database impact

- The baseline relies on authorized access to **Vacancy**, company-visible student data, **MatchResult**, and related **MatchFactor** explanation outputs or equivalent storage.
- Privacy-filtered presentation must be applied before company-facing retrieval completes.
- The unit should not create application, shortlist, or interview records directly.
