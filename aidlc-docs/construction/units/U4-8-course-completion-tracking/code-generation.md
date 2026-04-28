# Code generation: U4-8-course-completion-tracking

## Implementation plan

No application code for this unit.

This unit defines the course-completion baseline only. Later backend and frontend units may implement deterministic completion evaluation, protected learning-state reads, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U4-8-course-completion-tracking/unit-state.md`
- `aidlc-docs/construction/units/U4-8-course-completion-tracking/functional-design.md`
- `aidlc-docs/construction/units/U4-8-course-completion-tracking/nfr-requirements.md`
- `aidlc-docs/construction/units/U4-8-course-completion-tracking/nfr-design.md`
- `aidlc-docs/construction/units/U4-8-course-completion-tracking/infrastructure-design.md`
- `aidlc-docs/construction/units/U4-8-course-completion-tracking/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, privacy, and lesson-progress baselines.
- Confirm the unit defines protected course completion clearly.
- Confirm the unit remains separate from certificates, readiness scoring, and company-facing exposure workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the course-completion baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected course-completion flow documented
- Deterministic derivation expectations documented
- Relationship to lesson progress and later privacy-sensitive downstream use documented
- Separation from certificates and readiness logic preserved
- No application code introduced
