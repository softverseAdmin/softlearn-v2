# Code generation: U4-4-lesson-creation

## Implementation plan

No application code for this unit.

This unit defines the protected lesson-creation baseline only. Later backend and frontend units may implement authoring routes, validation, persistence, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U4-4-lesson-creation/unit-state.md`
- `aidlc-docs/construction/units/U4-4-lesson-creation/functional-design.md`
- `aidlc-docs/construction/units/U4-4-lesson-creation/nfr-requirements.md`
- `aidlc-docs/construction/units/U4-4-lesson-creation/nfr-design.md`
- `aidlc-docs/construction/units/U4-4-lesson-creation/infrastructure-design.md`
- `aidlc-docs/construction/units/U4-4-lesson-creation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, RBAC, routing, and layout baselines.
- Confirm the unit defines protected lesson creation clearly.
- Confirm the unit remains separate from lesson delivery and progress workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the lesson-creation baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected lesson-authoring flow documented
- Course-linked lesson structure documented
- Ordering and validation expectations documented
- Separation from lesson-viewing and progress units preserved
- No application code introduced
