# Infrastructure design: U10-1-apply-to-job

## Infrastructure impact

This unit does not provision infrastructure, but it defines a protected student-facing creation path for application records and their initial status history.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for application-eligibility refinements

## External services

- None required for the baseline apply-to-job flow
- External AI, workflow, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected application creation for authenticated students against visible vacancies.
- Later AWS-compatible deployment should preserve the same ownership, visibility, and audit posture for application submission.
- Apply-to-job behavior must remain compatible with later status tracking, company review, and interview workflows.

## Database impact

- The baseline relies on protected creation of **Application** and **ApplicationStatusHistory** records or equivalent status-trace handling.
- Application creation should preserve stable linkage between **StudentProfile** and **Vacancy**.
- The unit should not create shortlist, rejection, interview, or notification records directly.
