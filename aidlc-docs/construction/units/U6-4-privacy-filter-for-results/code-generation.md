# Code generation: U6-4-privacy-filter-for-results

## Implementation plan

No application code for this unit.

This unit defines the result privacy-filter baseline only. Later backend units may implement consent-aware filtering, visibility evaluation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U6-4-privacy-filter-for-results/unit-state.md`
- `aidlc-docs/construction/units/U6-4-privacy-filter-for-results/functional-design.md`
- `aidlc-docs/construction/units/U6-4-privacy-filter-for-results/nfr-requirements.md`
- `aidlc-docs/construction/units/U6-4-privacy-filter-for-results/nfr-design.md`
- `aidlc-docs/construction/units/U6-4-privacy-filter-for-results/infrastructure-design.md`
- `aidlc-docs/construction/units/U6-4-privacy-filter-for-results/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, privacy, and consent baselines.
- Confirm the unit defines result privacy filtering clearly.
- Confirm the unit remains separate from company-view UI detail and readiness workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the result privacy-filter baseline is rejected or replaced by an approved revision.

## Review checklist

- Result privacy-filter flow documented
- Consent-aware filtering, authorization, and audit expectations documented
- Relationship to later company-view and readiness-sensitive units documented
- Separation from company-view UI detail and readiness logic preserved
- No application code introduced
