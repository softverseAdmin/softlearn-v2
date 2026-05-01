# Code generation: U9-1-skill-matching

## Implementation plan

1. Add deterministic vacancy-to-student skill scoring that separates required and preferred skills.
2. Feed the skill factor into the shared match aggregation flow and explanation payloads.
3. Surface skill-aware results in the student matched-jobs and company matched-students APIs.
4. Cover ranked ordering and recommendation thresholds with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `backend/api/urls.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentMatchesPage.tsx`
- `frontend/src/features/profile/CompanyVacancyMatchesPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `frontend/src/features/profile/CompanyVacanciesPage.tsx`
- `aidlc-docs/construction/units/U9-1-skill-matching/code-generation.md`
- `aidlc-docs/construction/units/U9-1-skill-matching/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the deterministic skill-factor scoring helpers, match endpoints, UI pages, and tests.
- Restore the application to the prior non-matching behavior.

## Review checklist

- Required and preferred skills are scored deterministically
- Skill explanations remain human-readable
- Skill scoring feeds both student and company match views consistently
- Thresholded match ordering is covered by backend tests
