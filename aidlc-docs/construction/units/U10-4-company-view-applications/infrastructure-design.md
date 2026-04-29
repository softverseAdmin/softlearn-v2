# Infrastructure design: U10-4-company-view-applications

## Infrastructure impact

This unit does not provision infrastructure, but it defines a protected company-facing retrieval path for reviewing authorized application records.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for recruiter-side application-list refinements

## External services

- None required for the baseline company-view-applications flow
- External AI, workflow, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected company-side retrieval of authorized application records.
- Later AWS-compatible deployment should preserve the same company-boundary, privacy, and lifecycle-consumption posture.
- Company application review must remain compatible with later shortlist, rejection, interview, and notification workflows.

## Database impact

- The baseline relies on authorized retrieval of **Application**, **ApplicationStatusHistory**, **Vacancy**, and approved company-visible student context.
- Privacy filtering must be applied before company-facing application details are returned.
- The unit should not create shortlist, rejection, interview, or notification records directly.
