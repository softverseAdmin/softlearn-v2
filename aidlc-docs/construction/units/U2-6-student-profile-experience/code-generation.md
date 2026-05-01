# Code generation: U2-6-student-profile-experience

## Implementation plan

1. Add a student-owned `StudentExperience` model with typed experience kinds and timeline validation.
2. Extend the student profile API with nested experience records plus create, update, and delete endpoints.
3. Surface experience management inside the existing student profile page.
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
- `aidlc-docs/construction/units/U2-6-student-profile-experience/code-generation.md`
- `aidlc-docs/construction/units/U2-6-student-profile-experience/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the `StudentExperience` model, migration, profile endpoints, tests, and related profile-page UI.

## Review checklist

- Student experience-management flow documented
- Structured experience records are student-owned
- Protected CRUD routes reject non-student access
- Validation prevents invalid or contradictory experience timelines
