# Code generation: U10-6-reject-candidates

## Implementation plan

No application code for this unit.

This unit defines the reject-candidates baseline only. Later frontend and backend units may implement protected rejection actions, terminal-state handling, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U10-6-reject-candidates/unit-state.md`
- `aidlc-docs/construction/units/U10-6-reject-candidates/functional-design.md`
- `aidlc-docs/construction/units/U10-6-reject-candidates/nfr-requirements.md`
- `aidlc-docs/construction/units/U10-6-reject-candidates/nfr-design.md`
- `aidlc-docs/construction/units/U10-6-reject-candidates/infrastructure-design.md`
- `aidlc-docs/construction/units/U10-6-reject-candidates/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, company review, and application lifecycle baselines.
- Confirm the unit defines the rejection action clearly.
- Confirm the unit remains separate from notifications, shortlist, and downstream workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the reject-candidates baseline is rejected or replaced by an approved revision.

## Review checklist

- Company-side rejection action documented
- Authorization, terminal-state, and audit expectations documented
- Relationship to shared lifecycle and later communication units documented
- Separation from shortlist and downstream workflows preserved
- No application code introduced
