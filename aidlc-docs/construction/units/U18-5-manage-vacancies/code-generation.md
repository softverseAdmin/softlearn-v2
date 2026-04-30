# Code generation: U18-5-manage-vacancies

## Implementation plan

1. Extend the admin vacancy API so admins can list, create, update, and deactivate vacancies.
2. Keep vacancy ownership compatible with the current domain model by requiring a company-linked company user as the vacancy creator.
3. Add a protected admin vacancy management page that reuses the existing admin shell, form patterns, and session-aware API client.
4. Cover the admin vacancy flows with backend tests for list, create, update, deactivate, and invalid creator/company combinations.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/AdminVacanciesPage.tsx`
- `frontend/src/features/admin/types.ts`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/pages/DashboardPage.tsx`
- `aidlc-docs/construction/units/U18-5-manage-vacancies/code-generation.md`
- `aidlc-docs/construction/units/U18-5-manage-vacancies/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` or run the repository AI-DLC check in the available shell for this environment.

## Rollback plan

- Revert the admin vacancy API changes and remove the dedicated admin vacancy page and route.
- Restore the prior read-only admin vacancy listing behavior if the CRUD workflow is rejected.

## Review checklist

- Admins can list, create, update, and deactivate vacancies
- Vacancy creation keeps company and creator linkage valid
- Admin navigation and dashboard links expose the new workflow
- Backend and frontend contracts match
