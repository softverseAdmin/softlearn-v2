# Code generation: U2-8-student-resume-management

## Implementation plan

1. Add a student-owned `StudentResume` model for resume metadata with active-resume selection.
2. Extend the student profile API with nested resume records plus create, update, and delete endpoints.
3. Surface resume metadata management in the student profile page without introducing file storage coupling yet.
4. Cover protected resume metadata behavior in backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0020_student_profile_extensions.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentProfilePage.tsx`
- `aidlc-docs/construction/units/U2-8-student-resume-management/code-generation.md`
- `aidlc-docs/construction/units/U2-8-student-resume-management/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the `StudentResume` model, migration, profile endpoints, tests, and related profile-page UI.

## Review checklist

- Student resume-management flow documented
- Resume metadata stays student-owned and protected
- Active resume updates keep a single current resume at a time
- Scope stays metadata-first until a later storage unit is approved
