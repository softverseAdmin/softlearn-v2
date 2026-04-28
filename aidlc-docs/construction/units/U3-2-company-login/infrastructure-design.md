# Infrastructure design: U3-2-company-login

## Infrastructure impact

This unit does not provision infrastructure, but it defines company-login behavior that later backend runtime and frontend delivery must support consistently under the shared session-auth model.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected auth writes where applicable
- Optional future feature flags if company auth posture is refined later

## External services

- None required for the baseline company-login flow
- SSO, federation, or enterprise identity integrations may be introduced later but are out of scope for this unit

## Deployment impact

- Local-first development must support company-login requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same session-auth company-login behavior without changing the unit definition.
- Public login routes must remain compatible with the shared frontend delivery model.

## Database impact

- The baseline uses the shared authentication and role model to establish company-side user identity.
- Later company-profile, company-member, and hiring-preference records should consume this authenticated identity context rather than replace it.
