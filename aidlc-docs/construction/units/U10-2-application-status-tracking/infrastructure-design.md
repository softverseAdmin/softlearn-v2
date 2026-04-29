# Infrastructure design: U10-2-application-status-tracking

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected storage and retrieval behavior for authoritative application state and status history.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for lifecycle-status expansion

## External services

- None required for the baseline application-status-tracking flow
- External workflow, AI, and notification services are out of scope for this unit

## Deployment impact

- Local-first development must support protected lifecycle storage for application status and history.
- Later AWS-compatible deployment should preserve the same auditability, consistency, and access-control posture.
- Status-tracking behavior must remain compatible with later review, shortlist, rejection, interview, and notification workflows.

## Database impact

- The baseline relies on authoritative **Application** current-status fields and **ApplicationStatusHistory** records or equivalent lifecycle storage.
- History ordering and actor attribution should remain consistent across all later workflow actions.
- The unit should not create shortlist, rejection, interview, or notification records directly.
