# Code generation: U7-7-vacancy-language-requirements

## Implementation plan

1. Add structured vacancy language-requirement persistence with stable language, minimum-level, and requirement-type fields.
2. Extend company and admin vacancy authoring flows to manage Japanese and English requirement records safely.
3. Expose structured language requirements in vacancy serialization for discovery and later matching inputs.
4. Cover creation and update behavior with backend tests.

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
- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/code-generation.md`
- `aidlc-docs/construction/units/U7-7-vacancy-language-requirements/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the structured vacancy language-requirement models, API contract, and vacancy-editor changes.
- Restore vacancy authoring to the prior state without language metadata.

## Review checklist

- Vacancy language requirements are structured and vacancy-linked
- Minimum-level and required/preferred semantics remain validated
- Company and admin vacancy editors stay aligned with the same language contract
- Student discovery receives structured language inputs without redefining matching behavior
