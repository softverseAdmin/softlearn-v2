# Code generation: U6-3-company-view-student-results

## Implementation plan

No application code for this unit.

This unit defines the company-side student-results view baseline only. Later backend and frontend units may implement protected company result views, retrieval flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U6-3-company-view-student-results/unit-state.md`
- `aidlc-docs/construction/units/U6-3-company-view-student-results/functional-design.md`
- `aidlc-docs/construction/units/U6-3-company-view-student-results/nfr-requirements.md`
- `aidlc-docs/construction/units/U6-3-company-view-student-results/nfr-design.md`
- `aidlc-docs/construction/units/U6-3-company-view-student-results/infrastructure-design.md`
- `aidlc-docs/construction/units/U6-3-company-view-student-results/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, privacy, and company-boundary baselines.
- Confirm the unit defines protected company-side student results clearly.
- Confirm the unit remains separate from privacy-filter rule definition and readiness workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company-side student-results baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected company-side student-results flow documented
- Authorization, visibility, and audit expectations documented
- Relationship to later privacy-filter and readiness-sensitive units documented
- Separation from privacy-filter rule definition and readiness logic preserved
- No application code introduced
