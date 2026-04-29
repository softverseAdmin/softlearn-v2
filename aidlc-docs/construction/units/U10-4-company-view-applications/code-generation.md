# Code generation: U10-4-company-view-applications

## Implementation plan

No application code for this unit.

This unit defines the company-view-applications baseline only. Later frontend and backend units may implement authorized retrieval, privacy-safe rendering, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U10-4-company-view-applications/unit-state.md`
- `aidlc-docs/construction/units/U10-4-company-view-applications/functional-design.md`
- `aidlc-docs/construction/units/U10-4-company-view-applications/nfr-requirements.md`
- `aidlc-docs/construction/units/U10-4-company-view-applications/nfr-design.md`
- `aidlc-docs/construction/units/U10-4-company-view-applications/infrastructure-design.md`
- `aidlc-docs/construction/units/U10-4-company-view-applications/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, privacy-filter, and application lifecycle baselines.
- Confirm the unit defines authorized company-side application review clearly.
- Confirm the unit remains separate from shortlist, rejection, and interview actions.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company-view-applications baseline is rejected or replaced by an approved revision.

## Review checklist

- Company-side application-review flow documented
- Authorization and privacy-safe visibility expectations documented
- Relationship to shared lifecycle and later action units documented
- Separation from state-changing workflow actions preserved
- No application code introduced
