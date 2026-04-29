# Infrastructure design: U8-7-bookmark-jobs

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected frontend and backend interaction expectations for student-owned job-bookmark state consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for bookmark behavior refinements

## External services

- None required for the baseline bookmark-jobs flow
- Recommendation, notification, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected bookmark actions and bookmark-state reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-ownership posture, visible-job eligibility checks, and protected bookmark boundaries.
- Bookmark behavior must remain compatible with later saved-job, application, and matching workflows.

## Database impact

- The baseline relies on structured **JobBookmark** records linked to a student and a visible **Vacancy**.
- Later saved-job, application, and matching units should consume the same bookmark baseline rather than creating conflicting student-saved-job models.
- The unit should not create application or match records directly.
