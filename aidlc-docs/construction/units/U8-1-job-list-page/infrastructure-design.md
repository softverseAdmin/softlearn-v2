# Infrastructure design: U8-1-job-list-page

## Infrastructure impact

This unit does not provision infrastructure, but it defines stable frontend and backend interaction expectations for returning student-visible jobs in list form consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for job-list-page behavior refinements

## External services

- None required for the baseline job-list-page flow
- Analytics, recommendation, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support student-visible vacancy-list reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same visible-vacancy posture, predictable job-list behavior, and student discovery boundaries.
- Job-list-page behavior must remain compatible with later search, bookmark, application, and matching workflows.

## Database impact

- The baseline relies on structured **Vacancy** records with stable visible active posture and summary-ready fields.
- Later search, bookmark, application, and matching units should consume the same visible student job set rather than creating conflicting browseable-job models.
- The unit should not create bookmark, application, or match records directly.
