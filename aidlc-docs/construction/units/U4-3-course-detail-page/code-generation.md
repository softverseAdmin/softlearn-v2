# Code generation: U4-3-course-detail-page

## Implementation plan

No application code for this unit.

This unit defines the course-detail baseline only. Later backend and frontend units may implement detail routes, reads, fallback states, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U4-3-course-detail-page/unit-state.md`
- `aidlc-docs/construction/units/U4-3-course-detail-page/functional-design.md`
- `aidlc-docs/construction/units/U4-3-course-detail-page/nfr-requirements.md`
- `aidlc-docs/construction/units/U4-3-course-detail-page/nfr-design.md`
- `aidlc-docs/construction/units/U4-3-course-detail-page/infrastructure-design.md`
- `aidlc-docs/construction/units/U4-3-course-detail-page/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, data-model, API, routing, and layout baselines.
- Confirm the unit defines course-detail behavior clearly.
- Confirm the unit remains separate from listing, enrollment, and lesson-delivery workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the course-detail baseline is rejected or replaced by an approved revision.

## Review checklist

- Course-detail flow documented
- Single-course data expectations documented
- Navigation to later enrollment or lesson actions documented
- Separation from listing and learning-state tracking preserved
- No application code introduced
