# Code generation: U9-7-matched-student-list-for-company

## Implementation plan

No application code for this unit.

This unit defines the company-facing matched-student-list baseline only. Later frontend and backend units may implement protected retrieval, rendering, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/unit-state.md`
- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/functional-design.md`
- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/nfr-design.md`
- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, company-authorization, privacy-filter, and aggregate-scoring baselines.
- Confirm the unit defines company-facing matched-student presentation clearly.
- Confirm the unit remains separate from aggregate scoring and downstream hiring workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the matched-student-list baseline is rejected or replaced by an approved revision.

## Review checklist

- Company-facing matched-student-list flow documented
- Authorization and privacy-safe explanation expectations documented
- Relationship to upstream aggregate scoring documented
- Separation from scoring and downstream workflows preserved
- No application code introduced
