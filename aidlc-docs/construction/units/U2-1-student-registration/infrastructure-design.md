# Infrastructure design: U2-1-student-registration

## Infrastructure impact

This unit does not provision infrastructure, but it defines registration behavior that later backend runtime, frontend delivery, and session-aware environments must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings required for session-backed registration requests
- Optional future verification or notification settings if later units introduce them

## External services

- None required by the baseline registration flow itself
- Future email verification or notification delivery may be introduced later, but it is not part of this unit

## Deployment impact

- Local-first development must support public registration requests and session establishment between frontend and backend.
- Later AWS-compatible deployment should preserve the same registration and session behavior without changing the flow definition.
- Reverse-proxy and frontend hosting choices later must still support public registration pages and post-success redirects.

## Database impact

- Registration creates a new student user identity in the primary relational system of record.
- Later units may extend the user with richer student-profile, privacy, consent, and audit-related data.
- Role assignment for the created account must remain constrained to the student role in this flow.
