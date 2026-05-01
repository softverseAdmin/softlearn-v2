# Code generation: U18-2-manage-companies

## Implementation plan

Implementation started to expand existing baseline company management with full CRUD visibility and deactivation support.

**Backend enhancements:**
- Added `get_admin_company_queryset()` helper with Count annotations for accurate user and vacancy counts (with distinct=True for related joins)
- Enhanced `serialize_admin_company()` to include vacancy_count and active_vacancy_count fields with fallback support for both annotated and non-annotated queries
- Updated `admin_company_detail_view()` to support GET (retrieve detail), PUT (update), DELETE (soft deactivate) methods
- Added comprehensive test coverage for list, detail, and retire operations

**Frontend enhancements:**
- Rewrote AdminCompaniesPage to load both `/admin/companies` and `/admin/vacancies` in parallel for full context visibility
- Added company context panel showing creation/update timestamps and user/vacancy counts
- Added company members roster showing all users linked to the selected company
- Added linked vacancies section with vacancy summaries
- Implemented handleDeactivate() for company retire action via DELETE endpoint
- Enhanced TypeScript types with vacancy_count and active_vacancy_count fields

**Test coverage:**
- test_admin_can_create_update_and_retire_company: validates POST create, GET list, GET detail, PUT update, DELETE retire operations
- Verifies user_count, vacancy_count, active_vacancy_count in responses
- Tests pass cleanly (0 errors on newly added company management code)

**Pre-existing validation issues:**
- Backend test suite has 5 pre-existing test failures in unrelated test cases (Skill model uniqueness constraint, candidate preview logic)
- Frontend build has pre-existing TypeScript errors in unrelated files (unused variables, missing type properties)
- These do not block U18-2 validation; the company management code has zero lint/test errors

## Files to create or update

- `aidlc-docs/construction/units/U18-2-manage-companies/unit-state.md`
- `aidlc-docs/construction/units/U18-2-manage-companies/functional-design.md`
- `aidlc-docs/construction/units/U18-2-manage-companies/nfr-requirements.md`
- `aidlc-docs/construction/units/U18-2-manage-companies/nfr-design.md`
- `aidlc-docs/construction/units/U18-2-manage-companies/infrastructure-design.md`
- `aidlc-docs/construction/units/U18-2-manage-companies/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and adjacent domain baselines.
- Confirm the unit defines the workflow clearly.
- Confirm the unit remains separate from adjacent out-of-scope behaviors.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the manage companies baseline is rejected or replaced by an approved revision.

## Review checklist

- Manage companies documented
- Authorization, privacy, and deterministic behavior boundaries documented
- Relationship to adjacent units documented
- Global AI-DLC state updated
- No application code introduced
