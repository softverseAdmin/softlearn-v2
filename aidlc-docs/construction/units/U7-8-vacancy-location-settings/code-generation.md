# Code generation: U7-8-vacancy-location-settings

## Implementation plan

1. Extend vacancies with structured work-style and relocation-support settings alongside location.
2. Update company and admin vacancy authoring flows to manage location, work style, and relocation posture together.
3. Expose the structured location settings in vacancy serialization for discovery filters.
4. Cover persistence and update behavior with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0014_vacancy_metadata_and_bookmarks.py`
- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/CompanyVacanciesPage.tsx`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminVacanciesPage.tsx`
- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/code-generation.md`
- `aidlc-docs/construction/units/U7-8-vacancy-location-settings/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the structured vacancy work-style and relocation settings.
- Restore vacancy authoring to the prior location-only contract.

## Review checklist

- Vacancy location settings stay structured and vacancy-linked
- Work-style and relocation flags are validated consistently
- Company and admin vacancy editors use the same location contract
- Student discovery can filter on the new location/work-style metadata
