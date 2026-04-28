# Infrastructure design: U3-3-company-profile-basic

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated company basic-profile behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings needed for protected company profile update requests
- Optional future feature flags if company-profile UX is rolled out incrementally later

## External services

- None required by the baseline company basic-profile flow itself
- Later third-party company verification or enrichment integrations are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated company profile requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same profile read/update flow without changing the unit definition.
- Reverse-proxy and frontend hosting choices later must still support protected company routes and API-backed profile updates.

## Database impact

- The basic profile flow reads and updates company-owned profile data in the primary relational system of record.
- Later units will extend the company profile with description, hiring preferences, company membership, and vacancy-related data.
- This unit should remain compatible with a normalized company profile model rather than assuming all future company data lives in one flat record.
