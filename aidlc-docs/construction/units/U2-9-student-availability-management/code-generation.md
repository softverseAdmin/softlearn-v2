# Code generation: U2-9-student-availability-management

## Implementation plan

1. Add a student-owned `StudentAvailabilityProfile` model for job-search and interview-readiness metadata.
2. Extend the student profile API with nested availability data plus a protected update endpoint.
3. Surface availability management inside the existing student profile page.
4. Cover protected availability behavior in backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0020_student_profile_extensions.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentProfilePage.tsx`
- `aidlc-docs/construction/units/U2-9-student-availability-management/code-generation.md`
- `aidlc-docs/construction/units/U2-9-student-availability-management/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the `StudentAvailabilityProfile` model, migration, profile endpoints, tests, and related profile-page UI.

## Review checklist

- Student availability-management flow documented
- Structured availability stays student-owned and protected
- Job-search and scheduling-readiness fields are validated through a single profile contract
- Availability remains separate from actual interview scheduling workflows
