# Code generation: U1-4-base-api-structure

## Implementation plan

No application code for this unit.

This unit defines the API contract only. Later backend units may implement routing, serializers, validation, authorization, controllers, and tests from this baseline.

## Files to create or update

- `aidlc-docs/construction/units/U1-4-base-api-structure/unit-state.md`
- `aidlc-docs/construction/units/U1-4-base-api-structure/functional-design.md`
- `aidlc-docs/construction/units/U1-4-base-api-structure/nfr-requirements.md`
- `aidlc-docs/construction/units/U1-4-base-api-structure/nfr-design.md`
- `aidlc-docs/construction/units/U1-4-base-api-structure/infrastructure-design.md`
- `aidlc-docs/construction/units/U1-4-base-api-structure/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review API principles, endpoint definitions, request/response examples, authorization rules, and error format for completeness and consistency.
- Confirm the contract covers auth, profiles, learning, exams, jobs, matching, applications, interviews, and notifications.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the API contract is rejected or replaced by an approved revision.

## Review checklist

- RESTful structure documented
- `/api/v1/` versioning documented
- JWT auth documented
- Standard error format documented
- Student/company authorization rules documented
- Rule-based matching endpoints documented
- No application code introduced
