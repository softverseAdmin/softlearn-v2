# Infrastructure design: U3-4-company-profile-description

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated company-description behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings needed for protected company description update requests
- Optional future feature flags if company-description UX is rolled out incrementally later

## External services

- None required by the baseline company-description flow itself
- Rich text processing, translation, or branding integrations are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated company description requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same description read/update flow without changing the unit definition.
- Reverse-proxy and frontend hosting choices later must still support protected company routes and API-backed description updates.

## Database impact

- The description flow reads and updates company-owned profile data in the primary relational system of record.
- Later units will extend the company profile with hiring preferences, company membership, and vacancy-related data.
- This unit should remain compatible with a normalized company profile model rather than assuming all future company detail lives in one flat record.
