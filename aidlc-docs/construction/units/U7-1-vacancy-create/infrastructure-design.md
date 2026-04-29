# Infrastructure design: U7-1-vacancy-create

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected vacancy-definition persistence behavior that later company management routes and backend services must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-authoring workflow refinements

## External services

- None required for the baseline vacancy-creation flow
- Notification, analytics, and moderation services are out of scope for this unit

## Deployment impact

- Local-first development must support protected vacancy-creation reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-boundary posture, controlled draft visibility, and auditability expectations.
- Vacancy-creation behavior must remain compatible with later listing, detail, search, and matching workflows.

## Database impact

- The baseline relies on a structured **Vacancy** record linked to a company context.
- Later skill, language, and location requirement units should attach requirement records to the same vacancy identity rather than creating conflicting vacancy models.
- The unit should not create application, match, or company-visible student-result records directly.
