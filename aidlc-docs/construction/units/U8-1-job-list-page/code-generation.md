# Code generation: U8-1-job-list-page

## Implementation plan

No application code for this unit.

This unit defines the job-list-page baseline only. Later backend and frontend units may implement student-visible job browsing, list-page rendering, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U8-1-job-list-page/unit-state.md`
- `aidlc-docs/construction/units/U8-1-job-list-page/functional-design.md`
- `aidlc-docs/construction/units/U8-1-job-list-page/nfr-requirements.md`
- `aidlc-docs/construction/units/U8-1-job-list-page/nfr-design.md`
- `aidlc-docs/construction/units/U8-1-job-list-page/infrastructure-design.md`
- `aidlc-docs/construction/units/U8-1-job-list-page/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Confirm the unit defines the student job list page clearly.
- Confirm the unit remains separate from search controls, filters, bookmarks, applications, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the job-list-page baseline is rejected or replaced by an approved revision.

## Review checklist

- Student job-list-page flow documented
- Visible-job boundaries and stable list-state expectations documented
- Relationship to later search, filter, bookmark, application, and matching units documented
- Separation from search controls, filters, and matching logic preserved
- No application code introduced
