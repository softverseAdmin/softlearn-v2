# Code generation: U18-4-manage-exams

## Implementation plan

1. Add a shared `Exam` domain model so admin exam management uses reusable assessment records instead of a management-only artifact.
2. Add protected admin exam CRUD APIs with deterministic validation and soft-retire behavior.
3. Build an admin exams page with create, update, and deactivate workflows.
4. Cover admin access control, CRUD behavior, and exam-linked student result behavior with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0016_exam_examresult_exam.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminExamsPage.tsx`
- `frontend/src/features/profile/types.ts`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U18-4-manage-exams/code-generation.md`
- `aidlc-docs/construction/units/U18-4-manage-exams/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the shared exam model, admin exam APIs, admin exam page, and related tests.
- Restore exam results to the prior standalone title/category behavior if the shared exam-domain direction is rejected.

## Review checklist

- Exam management is admin-only
- Shared exam records are reusable by assessment flows
- Exam updates and retire actions are deterministic
- Admin UI and API contracts stay aligned
