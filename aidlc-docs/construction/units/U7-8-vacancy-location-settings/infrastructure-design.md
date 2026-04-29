# Infrastructure design: U7-8-vacancy-location-settings

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected requirement-persistence behavior for vacancy location settings that later company management routes and backend services must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-location workflow refinements

## External services

- None required for the baseline vacancy-location-settings flow
- Mapping, analytics, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected vacancy location-setting reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-boundary posture, structured work-style integrity, and auditability expectations.
- Vacancy location-setting behavior must remain compatible with later detail, search, application, and matching workflows.

## Database impact

- The baseline relies on structured **VacancyLocationPreference** records linked to **Vacancy**.
- Later search, application, and matching units should consume the same location-setting baseline rather than creating conflicting vacancy-location models.
- The unit should not create skill, language, application, or match records directly.
