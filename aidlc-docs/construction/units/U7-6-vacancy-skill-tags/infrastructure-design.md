# Infrastructure design: U7-6-vacancy-skill-tags

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected requirement-persistence behavior for vacancy skill tags that later company management routes and backend services must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for vacancy-skill workflow refinements

## External services

- None required for the baseline vacancy-skill-tags flow
- Taxonomy-management, analytics, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected vacancy skill-tag reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-boundary posture, taxonomy integrity, and auditability expectations.
- Vacancy skill-tag behavior must remain compatible with later detail, search, application, and matching workflows.

## Database impact

- The baseline relies on structured **VacancySkillRequirement** records linked to **Vacancy** and shared **Skill** data.
- Later search, application, and matching units should consume the same skill-requirement baseline rather than creating conflicting vacancy-skill models.
- The unit should not create language, location, application, or match records directly.
