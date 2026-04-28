# Infrastructure design: U2-2-student-login

## Infrastructure impact

This unit does not provision infrastructure, but it defines login behavior that later backend runtime, frontend delivery, and session-aware environments must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings needed for session-backed login requests
- Optional future account-protection settings if later units introduce them

## External services

- None required by the baseline login flow itself
- Future identity or notification integrations may be introduced later, but they are not part of this unit

## Deployment impact

- Local-first development must support public login requests and session establishment between frontend and backend.
- Later AWS-compatible deployment should preserve the same login and session behavior without changing the flow definition.
- Reverse-proxy and frontend hosting choices later must still support public login pages and post-success redirects.

## Database impact

- Login authenticates against the existing student user identity in the primary relational system of record.
- Later units may extend authentication-related audit, consent, or account-state data, but the baseline login flow remains narrow.
- Successful login should resolve into a student-role context only for this flow.
