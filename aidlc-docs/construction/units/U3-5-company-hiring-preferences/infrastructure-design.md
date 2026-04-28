# Infrastructure design: U3-5-company-hiring-preferences

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated company hiring-preference behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings needed for protected hiring-preference update requests
- Optional future feature flags if hiring-preferences UX is rolled out incrementally later

## External services

- None required by the baseline company hiring-preferences flow itself
- External recruiting integrations or labor-market data services are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated company hiring-preference requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same preference read/update flow without changing the unit definition.
- Reverse-proxy and frontend hosting choices later must still support protected company routes and API-backed preference updates.

## Database impact

- The preference flow reads and updates company-owned **CompanyHiringPreference** data in the primary relational system of record.
- Later units will connect this data to vacancy setup and candidate-review workflows.
- This unit should remain compatible with a normalized company preference model rather than assuming later vacancy data lives in the same record.
