# Code generation: U4-5-lesson-viewing

## Implementation plan

No application code for this unit.

This unit defines the lesson-viewing baseline only. Later backend and frontend units may implement protected lesson reads, student routes, navigation, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U4-5-lesson-viewing/unit-state.md`
- `aidlc-docs/construction/units/U4-5-lesson-viewing/functional-design.md`
- `aidlc-docs/construction/units/U4-5-lesson-viewing/nfr-requirements.md`
- `aidlc-docs/construction/units/U4-5-lesson-viewing/nfr-design.md`
- `aidlc-docs/construction/units/U4-5-lesson-viewing/infrastructure-design.md`
- `aidlc-docs/construction/units/U4-5-lesson-viewing/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, routing, and layout baselines.
- Confirm the unit defines protected lesson viewing clearly.
- Confirm the unit remains separate from enrollment and progress-tracking workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the lesson-viewing baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected lesson-viewing flow documented
- Access and navigation expectations documented
- Unauthorized and fallback outcomes documented
- Separation from enrollment and progress units preserved
- No application code introduced
