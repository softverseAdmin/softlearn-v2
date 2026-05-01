# Code generation: U2-5-student-profile-education

## Implementation plan

1. Add a student-owned `StudentEducation` model with protected validation for structured timeline records.
2. Extend the student profile API with nested education records plus create, update, and delete endpoints.
3. Surface education management inside the existing student profile page.
4. Cover the protected CRUD flow in backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0020_student_profile_extensions.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentProfilePage.tsx`
- `aidlc-docs/construction/units/U2-5-student-profile-education/code-generation.md`
- `aidlc-docs/construction/units/U2-5-student-profile-education/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the `StudentEducation` model, migration, profile endpoints, tests, and related profile-page UI.

## Review checklist

- Student education-management flow documented
- Structured education records are student-owned
- Protected CRUD routes reject non-student access
- Validation prevents invalid education timelines
