# Code generation: U4-7-lesson-progress-tracking

## Implementation plan

No application code for this unit.

This unit defines the lesson-progress baseline only. Later backend and frontend units may implement protected progress reads, writes, validation, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/unit-state.md`
- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/functional-design.md`
- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/nfr-requirements.md`
- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/nfr-design.md`
- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/infrastructure-design.md`
- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, RBAC, routing, and layout baselines.
- Confirm the unit defines protected lesson progress clearly.
- Confirm the unit remains separate from course-completion and analytics workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the lesson-progress baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected lesson-progress flow documented
- Enrollment-linked ownership and state expectations documented
- Duplicate-prevention and validation expectations documented
- Separation from course-completion logic preserved
- No application code introduced
