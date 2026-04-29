# Code generation: U5-1-exam-creation

## Implementation plan

No application code for this unit.

This unit defines the exam-creation baseline only. Later backend and frontend units may implement protected exam authoring, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U5-1-exam-creation/unit-state.md`
- `aidlc-docs/construction/units/U5-1-exam-creation/functional-design.md`
- `aidlc-docs/construction/units/U5-1-exam-creation/nfr-requirements.md`
- `aidlc-docs/construction/units/U5-1-exam-creation/nfr-design.md`
- `aidlc-docs/construction/units/U5-1-exam-creation/infrastructure-design.md`
- `aidlc-docs/construction/units/U5-1-exam-creation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and exam-domain baselines.
- Confirm the unit defines protected exam creation clearly.
- Confirm the unit remains separate from question authoring, exam taking, scoring, and results workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the exam-creation baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected exam-creation flow documented
- Authoring access, validation expectations, and integrity posture documented
- Relationship to later question, attempt, scoring, and results units documented
- Separation from exam-taking and outcome logic preserved
- No application code introduced
