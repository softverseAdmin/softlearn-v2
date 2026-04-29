# Infrastructure design: U7-5-vacancy-detail

## Infrastructure impact

This unit does not provision infrastructure, but it defines stable backend and frontend interaction expectations for returning one vacancy in detail form consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-detail behavior refinements

## External services

- None required for the baseline vacancy-detail flow
- Analytics, ranking, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support vacancy-detail reads between frontend and backend for the appropriate visibility context.
- Later AWS-compatible deployment should preserve the same active-vacancy posture, visibility expectations, and predictable detail behavior.
- Vacancy-detail behavior must remain compatible with later search, application, bookmark, and matching workflows.

## Database impact

- The baseline relies on structured **Vacancy** records with stable active or removed posture and detail-ready fields.
- Later requirement, search, application, and matching units should consume the same vacancy identity and visible-detail baseline rather than creating conflicting detail models.
- The unit should not create bookmark, application, or match records directly.
