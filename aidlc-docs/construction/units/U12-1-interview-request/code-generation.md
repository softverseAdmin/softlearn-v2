# Code generation: U12-1-interview-request

## Implementation plan

No application code for this unit.

This unit defines the interview request baseline only. Later frontend and backend units may implement the protected workflows, records, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U12-1-interview-request/unit-state.md`
- `aidlc-docs/construction/units/U12-1-interview-request/functional-design.md`
- `aidlc-docs/construction/units/U12-1-interview-request/nfr-requirements.md`
- `aidlc-docs/construction/units/U12-1-interview-request/nfr-design.md`
- `aidlc-docs/construction/units/U12-1-interview-request/infrastructure-design.md`
- `aidlc-docs/construction/units/U12-1-interview-request/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and adjacent domain baselines.
- Confirm the unit defines the workflow clearly.
- Confirm the unit remains separate from adjacent out-of-scope behaviors.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the interview request baseline is rejected or replaced by an approved revision.

## Review checklist

- Interview request documented
- Authorization, privacy, and deterministic behavior boundaries documented
- Relationship to adjacent units documented
- Global AI-DLC state updated
- No application code introduced
