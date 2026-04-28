# Code generation: U0-2-user-personas-definition

## Implementation plan

No application code for this inception unit.

This unit produces persona definitions only. Those definitions become reference inputs for later feature, security, matching, and admin design work.

## Files to create or update

- `aidlc-docs/construction/units/U0-2-user-personas-definition/functional-design.md`
- `aidlc-docs/construction/units/U0-2-user-personas-definition/nfr-requirements.md`
- `aidlc-docs/construction/units/U0-2-user-personas-definition/nfr-design.md`
- `aidlc-docs/construction/units/U0-2-user-personas-definition/infrastructure-design.md`
- `aidlc-docs/construction/units/U0-2-user-personas-definition/code-generation.md`
- `aidlc-docs/construction/units/U0-2-user-personas-definition/unit-state.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the persona documents for completeness and consistency.
- Confirm the five required personas are covered:
  - Foreign IT engineer learner
  - Japanese learner preparing IT career
  - Company recruiter
  - Company engineer reviewer
  - Platform admin
- Confirm each persona includes background, goals, pain points, technical level, and platform usage scenarios.
- Confirm the documents stay focused on user understanding and behavior.
- Confirm no technology stack is selected and no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the persona model is rejected or materially revised through later approved updates.

## Review checklist

- Both learner personas covered
- Both company personas covered
- Platform admin covered
- Required persona fields included
- Privacy and permission sensitivity reflected
- No implementation stack assumed
- No application code introduced
