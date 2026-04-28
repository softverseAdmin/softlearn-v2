# Infrastructure design: U1-2-authentication-core

## Infrastructure impact

This unit does not provision infrastructure, but it defines the auth behavior that later backend runtime, frontend integration, secret handling, and deployment units must support.

## Environment variables

- Django secret key
- Allowed frontend origin settings for local development
- Session cookie security settings by environment
- CSRF trusted origin settings
- Email or notification settings for password reset delivery later

## External services

- None required for the baseline local-first auth model
- Email delivery for password reset may be introduced in a later notification or infrastructure unit
- Hosted identity providers are intentionally out of scope for the current baseline

## Deployment impact

- Local development must support frontend-backend session and CSRF behavior cleanly.
- Later AWS-compatible deployment must preserve secure cookie, origin, and secret-management expectations.
- Session storage strategy may evolve later, but the browser auth model should remain stable.

## Database impact

- Authentication depends on the primary user identity model in the relational system of record.
- Later implementation may add session, password reset, login audit, and account state tables or models as needed.
- Auth design must remain compatible with consent, audit, and role data introduced by later units.
