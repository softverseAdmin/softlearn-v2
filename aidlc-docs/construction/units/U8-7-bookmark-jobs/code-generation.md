# Code generation: U8-7-bookmark-jobs

## Implementation plan

No application code for this unit.

This unit defines the bookmark-jobs baseline only. Later backend and frontend units may implement protected bookmark actions, saved-state rendering, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U8-7-bookmark-jobs/unit-state.md`
- `aidlc-docs/construction/units/U8-7-bookmark-jobs/functional-design.md`
- `aidlc-docs/construction/units/U8-7-bookmark-jobs/nfr-requirements.md`
- `aidlc-docs/construction/units/U8-7-bookmark-jobs/nfr-design.md`
- `aidlc-docs/construction/units/U8-7-bookmark-jobs/infrastructure-design.md`
- `aidlc-docs/construction/units/U8-7-bookmark-jobs/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Confirm the unit defines job bookmarking clearly.
- Confirm the unit remains separate from applications, recommendations, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the bookmark-jobs baseline is rejected or replaced by an approved revision.

## Review checklist

- Bookmark-jobs flow documented
- Student ownership, visible-job eligibility, and validation expectations documented
- Relationship to later saved-job, application, and matching units documented
- Separation from applications and matching logic preserved
- No application code introduced
