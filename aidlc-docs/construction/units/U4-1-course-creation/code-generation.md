# Code generation: U4-1-course-creation

## Implementation plan

No application code for this unit.

This unit defines the protected course-creation baseline only. Later backend and frontend units may implement privileged authoring routes, validation, persistence, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U4-1-course-creation/unit-state.md`
- `aidlc-docs/construction/units/U4-1-course-creation/functional-design.md`
- `aidlc-docs/construction/units/U4-1-course-creation/nfr-requirements.md`
- `aidlc-docs/construction/units/U4-1-course-creation/nfr-design.md`
- `aidlc-docs/construction/units/U4-1-course-creation/infrastructure-design.md`
- `aidlc-docs/construction/units/U4-1-course-creation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, RBAC, API, routing, and layout baselines.
- Confirm the unit defines protected course creation clearly.
- Confirm the unit remains separate from student-facing learning workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the course-creation baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected course-authoring flow documented
- Validation outcomes documented
- Separation from listing, detail, lesson, and enrollment units preserved
- Non-public initial visibility posture documented
- No application code introduced
