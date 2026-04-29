# Infrastructure design: U7-7-vacancy-language-requirements

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected requirement-persistence behavior for vacancy language requirements that later company management routes and backend services must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-language workflow refinements

## External services

- None required for the baseline vacancy-language-requirements flow
- Language-taxonomy management, analytics, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected vacancy language-requirement reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-boundary posture, model integrity, and auditability expectations.
- Vacancy language-requirement behavior must remain compatible with later detail, search, application, and matching workflows.

## Database impact

- The baseline relies on structured **VacancyLanguageRequirement** records linked to **Vacancy** and shared **LanguageLevel** data.
- Later search, application, and matching units should consume the same language-requirement baseline rather than creating conflicting vacancy-language models.
- The unit should not create skill, location, application, or match records directly.
