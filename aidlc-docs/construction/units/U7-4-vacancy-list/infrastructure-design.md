# Infrastructure design: U7-4-vacancy-list

## Infrastructure impact

This unit does not provision infrastructure, but it defines stable backend and frontend interaction expectations for returning vacancy summaries in list form consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-list behavior refinements

## External services

- None required for the baseline vacancy-list flow
- Analytics, ranking, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support vacancy-list reads between frontend and backend for the appropriate visibility context.
- Later AWS-compatible deployment should preserve the same active-vacancy posture, visibility expectations, and predictable list behavior.
- Vacancy-list behavior must remain compatible with later detail, search, application, and matching workflows.

## Database impact

- The baseline relies on structured **Vacancy** records with stable active or removed posture and summary-ready fields.
- Later detail, search, application, and matching units should consume the same visible vacancy set rather than creating conflicting list models.
- The unit should not create bookmark, application, or match records directly.
