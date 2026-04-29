# Infrastructure design: U8-4-language-filter

## Infrastructure impact

This unit does not provision infrastructure, but it defines interactive frontend and backend behavior for applying structured language filtering to the visible student job set consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for language-filter behavior refinements

## External services

- None required for the baseline language-filter flow
- Search-engine, recommendation, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support language-filtered reads against the student-visible job set between frontend and backend.
- Later AWS-compatible deployment should preserve the same visible-vacancy posture, predictable structured filter behavior, and student discovery boundaries.
- Language-filter behavior must remain compatible with later bookmarks, applications, and matching workflows.

## Database impact

- The baseline relies on structured **VacancyLanguageRequirement** data linked to visible **Vacancy** records.
- Later bookmarks, applications, and matching units should consume the same language-filtered visible-job baseline rather than creating conflicting structured-filter models.
- The unit should not create bookmark, application, or match records directly.
