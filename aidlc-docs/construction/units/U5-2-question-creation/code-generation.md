# Code generation: U5-2-question-creation

## Implementation plan

No application code for this unit.

This unit defines the question-creation baseline only. Later backend and frontend units may implement protected question authoring, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U5-2-question-creation/unit-state.md`
- `aidlc-docs/construction/units/U5-2-question-creation/functional-design.md`
- `aidlc-docs/construction/units/U5-2-question-creation/nfr-requirements.md`
- `aidlc-docs/construction/units/U5-2-question-creation/nfr-design.md`
- `aidlc-docs/construction/units/U5-2-question-creation/infrastructure-design.md`
- `aidlc-docs/construction/units/U5-2-question-creation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and exam-domain baselines.
- Confirm the unit defines protected question creation clearly.
- Confirm the unit remains separate from answer-options, exam taking, scoring, and results workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the question-creation baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected question-creation flow documented
- Authoring access, validation expectations, and integrity posture documented
- Relationship to later answer-options, delivery, submission, and scoring units documented
- Separation from exam-taking and outcome logic preserved
- No application code introduced
