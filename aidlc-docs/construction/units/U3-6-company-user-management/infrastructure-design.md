# Infrastructure design: U3-6-company-user-management

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated company user-management behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings needed for protected company-member management requests
- Optional future feature flags if company membership-management UX is rolled out incrementally later

## External services

- None required by the baseline company user-management flow itself
- Enterprise identity, SSO, or external directory integrations are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated company-member management requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same company-member management behavior without changing the unit definition.
- Reverse-proxy and frontend hosting choices later must still support protected company routes and API-backed membership updates.

## Database impact

- The membership flow reads and updates company-owned **CompanyMember** data in the primary relational system of record.
- Later units will connect this data to company-scoped workflow ownership and audit logging.
- This unit should remain compatible with a normalized company membership model rather than assuming role scope, company profile, and vacancy ownership all live in one record.
