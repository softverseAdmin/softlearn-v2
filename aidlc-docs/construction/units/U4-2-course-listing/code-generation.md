# Code generation: U4-2-course-listing

## Implementation plan

No application code for this unit.

This unit defines the course-listing baseline only. Later backend and frontend units may implement listing behavior, routing, fallback states, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U4-2-course-listing/unit-state.md`
- `aidlc-docs/construction/units/U4-2-course-listing/functional-design.md`
- `aidlc-docs/construction/units/U4-2-course-listing/nfr-requirements.md`
- `aidlc-docs/construction/units/U4-2-course-listing/nfr-design.md`
- `aidlc-docs/construction/units/U4-2-course-listing/infrastructure-design.md`
- `aidlc-docs/construction/units/U4-2-course-listing/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, data-model, API, routing, layout, and frontend-state baselines.
- Confirm the unit defines course-listing behavior clearly.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the course-listing baseline is rejected or replaced by an approved revision.

## Review checklist

- Course-listing flow documented
- API, routing, and layout alignment documented
- Scope kept separate from course-detail, enrollment, and lesson units
- Fallback-state behavior documented
- No application code introduced
