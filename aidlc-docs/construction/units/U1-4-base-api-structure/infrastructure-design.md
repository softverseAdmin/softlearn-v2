# Infrastructure design: U1-4-base-api-structure

## Infrastructure impact

This unit does not provision infrastructure, but it defines the API contract that later backend runtime, auth, and deployment units must support.

## Environment variables

Likely later configuration areas include:

- Django secret key
- Session cookie security settings
- CSRF trusted origin settings
- API base URL
- frontend origin settings

These are not finalized in this unit.

## External services

- None required by the API contract itself
- Notification delivery, file storage, and meeting-link integrations may appear in later implementation units

## Deployment impact

- The contract is designed to work in local-first development and later AWS-compatible deployment.
- The `/api/v1/` structure should remain stable across local and deployed environments.

## Database impact

- The API contract depends on the conceptual entities already identified in the high-level data model.
- Later implementation units should map these routes to users, profiles, courses, enrollments, exam attempts, jobs, match results, applications, interviews, notifications, consent, and audit records.
