# Code generation: U7-7-vacancy-language-requirements

## Implementation plan

No application code for this unit.

This unit defines the vacancy-language-requirements baseline only. Later backend and frontend units may implement protected language-requirement authoring, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/unit-state.md`
- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/functional-design.md`
- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/nfr-design.md`
- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and shared-language-model baselines.
- Confirm the unit defines structured vacancy language requirements clearly.
- Confirm the unit remains separate from skill tags, location settings, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-language-requirements baseline is rejected or replaced by an approved revision.

## Review checklist

- Vacancy-language-requirements flow documented
- Company ownership, shared-model, and validation expectations documented
- Relationship to later search, application, and matching units documented
- Separation from skill, location, and matching logic preserved
- No application code introduced
