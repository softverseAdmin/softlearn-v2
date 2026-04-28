# Code generation: U1-2-authentication-core

## Implementation plan

No application code for this unit.

This unit defines the authentication baseline only. Later backend and frontend units may implement user models, login/logout endpoints, session handling, CSRF integration, password reset flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U1-2-authentication-core/unit-state.md`
- `aidlc-docs/construction/units/U1-2-authentication-core/functional-design.md`
- `aidlc-docs/construction/units/U1-2-authentication-core/nfr-requirements.md`
- `aidlc-docs/construction/units/U1-2-authentication-core/nfr-design.md`
- `aidlc-docs/construction/units/U1-2-authentication-core/infrastructure-design.md`
- `aidlc-docs/construction/units/U1-2-authentication-core/code-generation.md`
- `aidlc-docs/construction/units/U1-4-base-api-structure/*` to align the API contract with session auth
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against ADR-001, architecture, and security baseline documents.
- Confirm the auth model is session-based and browser-oriented.
- Confirm auth scope covers signup, login, logout, session restore, password change, and password reset.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the auth foundation is rejected or replaced by an approved revision.

## Review checklist

- Session-based auth documented
- Signup/login/logout/reset flows covered
- CSRF expectations documented
- Auth separated from RBAC and privacy authorization
- U1-4 API contract aligned away from JWT-first auth
- No application code introduced
