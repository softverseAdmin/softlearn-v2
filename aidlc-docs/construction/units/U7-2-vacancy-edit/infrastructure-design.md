# Infrastructure design: U7-2-vacancy-edit

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected vacancy-update behavior that later company management routes and backend services must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-edit workflow refinements

## External services

- None required for the baseline vacancy-edit flow
- Notification, analytics, and moderation services are out of scope for this unit

## Deployment impact

- Local-first development must support protected vacancy-edit reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-boundary posture, controlled visibility changes, and auditability expectations.
- Vacancy-edit behavior must remain compatible with later listing, detail, search, and matching workflows.

## Database impact

- The baseline relies on a structured **Vacancy** record linked to a company context and preserved across updates.
- Later skill, language, and location requirement units should continue attaching requirement records to the same vacancy identity.
- The unit should not create application, match, or company-visible student-result records directly.
