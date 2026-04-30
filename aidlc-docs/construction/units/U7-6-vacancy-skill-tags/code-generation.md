# Code generation: U7-6-vacancy-skill-tags

## Implementation plan

1. Add structured vacancy skill-requirement persistence linked to the shared `Skill` taxonomy.
2. Extend company and admin vacancy authoring flows to create, update, and remove required and preferred skill tags.
3. Expose structured skill requirements in vacancy serialization for discovery and later matching inputs.
4. Cover metadata persistence and update behavior with backend tests.

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
- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/code-generation.md`
- `aidlc-docs/construction/units/U7-6-vacancy-skill-tags/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the structured vacancy skill-requirement models, API contract, and vacancy-editor changes.
- Restore vacancy authoring to the prior unstructured state without skill metadata.

## Review checklist

- Vacancy skill requirements are structured and vacancy-linked
- Required and preferred skill semantics stay deterministic
- Company and admin vacancy editors stay aligned with the same skill contract
- Student discovery receives structured skill inputs without changing matching logic
