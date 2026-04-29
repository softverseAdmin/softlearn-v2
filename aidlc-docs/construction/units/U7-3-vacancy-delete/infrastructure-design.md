# Infrastructure design: U7-3-vacancy-delete

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected vacancy-removal behavior that later company management routes and backend services must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-removal workflow refinements

## External services

- None required for the baseline vacancy-delete flow
- Notification, analytics, and moderation services are out of scope for this unit

## Deployment impact

- Local-first development must support protected vacancy-delete actions between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-boundary posture, controlled inactive-state behavior, and auditability expectations.
- Vacancy-delete behavior must remain compatible with later listing, detail, search, application, and matching workflows.

## Database impact

- The baseline relies on a structured **Vacancy** record linked to a company context and able to represent an inactive or removed posture.
- Later requirement, application, and matching units should consume the same active-versus-removed vacancy identity rather than creating conflicting availability models.
- The unit should not create application, match, or company-visible student-result records directly.
