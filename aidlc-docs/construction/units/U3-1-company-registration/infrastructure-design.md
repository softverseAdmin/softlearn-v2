# Infrastructure design: U3-1-company-registration

## Infrastructure impact

This unit does not provision infrastructure, but it defines company-registration behavior that later backend runtime and frontend delivery must support consistently under the shared session-auth model.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected registration writes where applicable
- Optional future feature flags if company onboarding posture is refined later

## External services

- None required for the baseline company-registration flow
- Email verification or approval services may be introduced later but are out of scope for this unit

## Deployment impact

- Local-first development must support company-registration requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same session-auth company-registration behavior without changing the unit definition.
- Public registration routes must remain compatible with the shared frontend delivery model.

## Database impact

- The baseline creates company-side user identity within the shared authentication and role model.
- Later company-profile, company-member, and hiring-preference records should extend from this initial company-side account rather than replacing it.
