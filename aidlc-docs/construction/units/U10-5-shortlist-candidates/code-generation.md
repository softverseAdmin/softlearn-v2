# Code generation: U10-5-shortlist-candidates

## Implementation plan

No application code for this unit.

This unit defines the shortlist-candidates baseline only. Later frontend and backend units may implement protected shortlist actions, shortlist-state handling, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U10-5-shortlist-candidates/unit-state.md`
- `aidlc-docs/construction/units/U10-5-shortlist-candidates/functional-design.md`
- `aidlc-docs/construction/units/U10-5-shortlist-candidates/nfr-requirements.md`
- `aidlc-docs/construction/units/U10-5-shortlist-candidates/nfr-design.md`
- `aidlc-docs/construction/units/U10-5-shortlist-candidates/infrastructure-design.md`
- `aidlc-docs/construction/units/U10-5-shortlist-candidates/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, company review, and application lifecycle baselines.
- Confirm the unit defines the shortlist action clearly.
- Confirm the unit remains separate from shortlist-view presentation, rejection, and downstream workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the shortlist-candidates baseline is rejected or replaced by an approved revision.

## Review checklist

- Company-side shortlist action documented
- Authorization, duplicate-prevention, and lifecycle expectations documented
- Relationship to later shortlist-view and workflow units documented
- Separation from shortlist browsing and downstream actions preserved
- No application code introduced
