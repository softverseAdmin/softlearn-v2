# Infrastructure design: U2-3-student-profile-basic

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated profile behavior that later backend runtime, frontend delivery, and session-aware environments must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings needed for protected student profile update requests
- Optional future feature flags if later profile expansion requires controlled rollout

## External services

- None required by the baseline student basic profile flow itself
- Later resume/file or notification integrations may appear in downstream units but are not part of this unit

## Deployment impact

- Local-first development must support authenticated student profile requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same profile read/update flow without changing the unit definition.
- Reverse-proxy and frontend hosting choices later must still support protected student routes and API-backed profile updates.

## Database impact

- The basic profile flow reads and updates student-owned profile data in the primary relational system of record.
- Later units will extend the student profile with richer subdomains such as skills, education, experience, privacy, and consent data.
- This unit should remain compatible with a normalized student profile model rather than assuming all future data lives in one flat record.
