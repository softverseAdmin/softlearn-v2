# Code generation: U7-8-vacancy-location-settings

## Implementation plan

No application code for this unit.

This unit defines the vacancy-location-settings baseline only. Later backend and frontend units may implement protected location-setting authoring, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/unit-state.md`
- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/functional-design.md`
- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/nfr-design.md`
- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Confirm the unit defines structured vacancy location settings clearly.
- Confirm the unit remains separate from skill tags, language requirements, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-location-settings baseline is rejected or replaced by an approved revision.

## Review checklist

- Vacancy-location-settings flow documented
- Company ownership, structured-setting, and validation expectations documented
- Relationship to later search, application, and matching units documented
- Separation from skill, language, and matching logic preserved
- No application code introduced
