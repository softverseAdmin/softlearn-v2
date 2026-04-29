# Code generation: U18-4-manage-exams

## Implementation plan

No application code for this unit.

This unit defines the manage exams baseline only. Later frontend and backend units may implement the protected workflows, records, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U18-4-manage-exams/unit-state.md`
- `aidlc-docs/construction/units/U18-4-manage-exams/functional-design.md`
- `aidlc-docs/construction/units/U18-4-manage-exams/nfr-requirements.md`
- `aidlc-docs/construction/units/U18-4-manage-exams/nfr-design.md`
- `aidlc-docs/construction/units/U18-4-manage-exams/infrastructure-design.md`
- `aidlc-docs/construction/units/U18-4-manage-exams/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and adjacent domain baselines.
- Confirm the unit defines the workflow clearly.
- Confirm the unit remains separate from adjacent out-of-scope behaviors.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the manage exams baseline is rejected or replaced by an approved revision.

## Review checklist

- Manage exams documented
- Authorization, privacy, and deterministic behavior boundaries documented
- Relationship to adjacent units documented
- Global AI-DLC state updated
- No application code introduced
