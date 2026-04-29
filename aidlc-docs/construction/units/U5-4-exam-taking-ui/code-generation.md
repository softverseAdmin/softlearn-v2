# Code generation: U5-4-exam-taking-ui

## Implementation plan

No application code for this unit.

This unit defines the exam-taking UI baseline only. Later backend and frontend units may implement protected student exam routes, presentation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U5-4-exam-taking-ui/unit-state.md`
- `aidlc-docs/construction/units/U5-4-exam-taking-ui/functional-design.md`
- `aidlc-docs/construction/units/U5-4-exam-taking-ui/nfr-requirements.md`
- `aidlc-docs/construction/units/U5-4-exam-taking-ui/nfr-design.md`
- `aidlc-docs/construction/units/U5-4-exam-taking-ui/infrastructure-design.md`
- `aidlc-docs/construction/units/U5-4-exam-taking-ui/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, frontend, and exam-domain baselines.
- Confirm the unit defines protected exam-taking UI behavior clearly.
- Confirm the unit remains separate from answer submission, scoring, results, and retake workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the exam-taking UI baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected exam-taking UI flow documented
- Student access, presentation, and navigation expectations documented
- Relationship to later submission, scoring, history, and retake units documented
- Separation from answer-submission and outcome logic preserved
- No application code introduced
