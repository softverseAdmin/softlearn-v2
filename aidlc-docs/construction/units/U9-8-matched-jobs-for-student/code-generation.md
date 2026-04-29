# Code generation: U9-8-matched-jobs-for-student

## Implementation plan

No application code for this unit.

This unit defines the student-facing matched-jobs baseline only. Later frontend and backend units may implement protected retrieval, rendering, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/unit-state.md`
- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/functional-design.md`
- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/nfr-design.md`
- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, vacancy-visibility, job-search, bookmark, and aggregate-scoring baselines.
- Confirm the unit defines student-facing matched-job presentation clearly.
- Confirm the unit remains separate from aggregate scoring, search, bookmarks, and downstream workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the matched-jobs baseline is rejected or replaced by an approved revision.

## Review checklist

- Student-facing matched-jobs flow documented
- Visibility and explanation expectations documented
- Relationship to upstream aggregate scoring documented
- Separation from search, bookmarks, and downstream workflows preserved
- No application code introduced
