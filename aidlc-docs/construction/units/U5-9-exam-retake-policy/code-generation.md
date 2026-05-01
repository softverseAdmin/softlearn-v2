# Code generation: U5-9-exam-retake-policy

## Implementation plan

1. Add explicit exam-level `max_attempts` policy.
2. Determine retake eligibility from prior scored results and pass/fail outcomes.
3. Block further attempts after a pass or after the attempt cap is reached.
4. Surface retake eligibility on student exam history and exam-taking routes.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0018_exam_questions_attempts.py`
- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentExamResultsPage.tsx`
- `frontend/src/features/profile/StudentExamPage.tsx`
- `frontend/src/features/admin/AdminExamsPage.tsx`
- `frontend/src/features/admin/types.ts`
- `aidlc-docs/construction/units/U5-9-exam-retake-policy/code-generation.md`
- `aidlc-docs/construction/units/U5-9-exam-retake-policy/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert explicit retake policy fields, eligibility logic, and related tests.

## Review checklist

- Retake rules are deterministic and exam-owned
- Students cannot retry after passing
- Attempt caps are enforced consistently across summary and detail routes

