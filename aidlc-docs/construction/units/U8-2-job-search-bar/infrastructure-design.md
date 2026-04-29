# Infrastructure design: U8-2-job-search-bar

## Infrastructure impact

This unit does not provision infrastructure, but it defines interactive frontend and backend behavior for applying a general search query to the visible student job set consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for search-bar behavior refinements

## External services

- None required for the baseline job-search-bar flow
- Search-engine, recommendation, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support query-driven reads against the student-visible job set between frontend and backend.
- Later AWS-compatible deployment should preserve the same visible-vacancy posture, predictable query behavior, and student discovery boundaries.
- Job-search-bar behavior must remain compatible with later structured filters, bookmarks, applications, and matching workflows.

## Database impact

- The baseline relies on structured **Vacancy** records and approved visible search fields drawn from the student-visible job set.
- Later structured filters, bookmarks, applications, and matching units should consume the same searched visible-job baseline rather than creating conflicting query models.
- The unit should not create bookmark, application, or match records directly.
