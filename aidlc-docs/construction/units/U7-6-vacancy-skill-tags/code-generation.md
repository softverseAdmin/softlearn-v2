# Code generation: U7-6-vacancy-skill-tags

## Implementation plan

No application code for this unit.

This unit defines the vacancy-skill-tags baseline only. Later backend and frontend units may implement protected skill-requirement authoring, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/unit-state.md`
- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/functional-design.md`
- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/nfr-design.md`
- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and taxonomy baselines.
- Confirm the unit defines structured vacancy skill tags clearly.
- Confirm the unit remains separate from language requirements, location settings, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-skill-tags baseline is rejected or replaced by an approved revision.

## Review checklist

- Vacancy-skill-tags flow documented
- Company ownership, taxonomy, and validation expectations documented
- Relationship to later search, application, and matching units documented
- Separation from language, location, and matching logic preserved
- No application code introduced
