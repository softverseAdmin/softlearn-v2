# Infrastructure design: U8-6-salary-filter

## Infrastructure impact

This unit does not provision infrastructure, but it defines interactive frontend and backend behavior for applying salary filtering to the visible student job set consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for salary-filter behavior refinements

## External services

- None required for the baseline salary-filter flow
- Search-engine, recommendation, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support salary-filtered reads against the student-visible job set between frontend and backend.
- Later AWS-compatible deployment should preserve the same visible-vacancy posture, predictable salary-filter behavior, and student discovery boundaries.
- Salary-filter behavior must remain compatible with later bookmarks, applications, and matching workflows.

## Database impact

- The baseline relies on structured visible **Vacancy** records and approved salary-ready metadata where available.
- Later bookmarks, applications, and matching units should consume the same salary-filtered visible-job baseline rather than creating conflicting structured-filter models.
- The unit should not create bookmark, application, or match records directly.
