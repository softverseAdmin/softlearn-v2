# Infrastructure design: U2-9-student-availability-management

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated student availability-management behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected student availability updates
- Optional future feature flags if richer scheduling-readiness UX is rolled out incrementally

## External services

- None required for the baseline student availability-management flow
- Calendar providers, interview schedulers, or notification integrations are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated student availability reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same structured availability-management behavior without changing the unit definition.
- Protected student profile routes and data writes must remain available in every supported environment.

## Database impact

- The baseline relies on student-owned **StudentAvailability** records tied to **StudentProfile**.
- The design should support structured availability state and a stable notion of whether availability has been set.
- Later scheduling, application, and privacy units should reuse the same profile-owned availability model rather than creating disconnected readiness records.
